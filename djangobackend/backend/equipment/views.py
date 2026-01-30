from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import EquipmentDataset
from .serializers import EquipmentDatasetSerializer
import pandas as pd
from django.core.files.storage import default_storage
from django.conf import settings
from reportlab.pdfgen import canvas
from django.http import FileResponse
from django.contrib.auth.models import User
import os
import time
import logging

@method_decorator(csrf_exempt, name='dispatch')
class UploadCSVView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)
        
        # Validate file extension
        if not file_obj.name.endswith('.csv'):
            return Response({'error': 'Only CSV files are allowed'}, status=400)
        
        # Save file temporarily
        file_path = default_storage.save('tmp/' + file_obj.name, file_obj)
        abs_path = os.path.join(settings.MEDIA_ROOT, file_path)
        
        # Write a small debug snapshot of the uploaded file (first bytes)
        logger = logging.getLogger(__name__)
        try:
            debug_dir = os.path.join(settings.MEDIA_ROOT, 'tmp')
            os.makedirs(debug_dir, exist_ok=True)
            preview_name = f"debug_upload_{int(time.time())}_{file_obj.name}.preview"
            preview_path = os.path.join(debug_dir, preview_name)
            with open(abs_path, 'rb') as src, open(preview_path, 'wb') as dst:
                dst.write(src.read(2048))
            logger.debug('Wrote upload preview to %s', preview_path)
        except Exception as e:
            logger.exception('Failed to write upload preview: %s', e)
        
        # Parse CSV
        try:
            df = pd.read_csv(abs_path)
        except Exception as e:
            return Response({'error': f'Failed to parse CSV: {str(e)}'}, status=400)
        
        # Validate required columns (case-insensitive)
        cols = [c.strip().lower() for c in df.columns]
        # Equipment Name is optional; require only core numeric and type columns
        required = ['type', 'flowrate', 'pressure', 'temperature']
        missing = [r for r in required if not any(r == c or r in c for c in cols)]
        if missing:
            return Response({'error': f'Missing required columns: {", ".join(missing)}. Found columns: {", ".join(df.columns)}'}, status=400)
        summary = self.get_summary(df)
        dataset = EquipmentDataset.objects.create(
            user=request.user,
            file_name=file_obj.name,
            record_count=len(df),
            summary=summary,
            csv_file=file_obj
        )
        # Keep only last 5 for this user
        qs = EquipmentDataset.objects.filter(user=request.user)
        if qs.count() > 5:
            for obj in qs[5:]:
                obj.csv_file.delete()
                obj.delete()
        return Response(EquipmentDatasetSerializer(dataset).data)

    def get_summary(self, df):
        # Helper to find a column case-insensitively
        def find_col(key):
            for c in df.columns:
                if c.lower() == key.lower():
                    return df[c]
            return None

        flow = find_col('Flowrate')
        pressure = find_col('Pressure')
        temp = find_col('Temperature')
        typ = find_col('Type')

        summary = {
            'totalCount': len(df),
            'avgFlowrate': float(flow.mean()) if flow is not None and not flow.empty else None,
            'avgPressure': float(pressure.mean()) if pressure is not None and not pressure.empty else None,
            'avgTemperature': float(temp.mean()) if temp is not None and not temp.empty else None,
            'typeDistribution': typ.value_counts().to_dict() if typ is not None else {},
            'minFlowrate': float(flow.min()) if flow is not None and not flow.empty else None,
            'maxFlowrate': float(flow.max()) if flow is not None and not flow.empty else None,
            'minPressure': float(pressure.min()) if pressure is not None and not pressure.empty else None,
            'maxPressure': float(pressure.max()) if pressure is not None and not pressure.empty else None,
            'minTemperature': float(temp.min()) if temp is not None and not temp.empty else None,
            'maxTemperature': float(temp.max()) if temp is not None and not temp.empty else None,
        }
        return summary

class SummaryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        dataset_id = request.query_params.get('id')
        if dataset_id:
            dataset = EquipmentDataset.objects.filter(id=dataset_id, user=request.user).first()
            if not dataset:
                return Response({'error': 'Dataset not found'}, status=404)
            return Response(dataset.summary)
        # Try to find a dataset with valid equipment data (has avgFlowrate)
        for dataset in EquipmentDataset.objects.filter(user=request.user):
            if dataset.summary and dataset.summary.get('avgFlowrate') is not None:
                return Response(dataset.summary)
        # Fallback to latest for this user
        latest = EquipmentDataset.objects.filter(user=request.user).first()
        if not latest:
            return Response({'error': 'No data'}, status=404)
        return Response(latest.summary)

class HistoryView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # If unauthenticated, return recent datasets across users (empty or public)
        if request.user and request.user.is_authenticated:
            qs = EquipmentDataset.objects.filter(user=request.user)[:5]
        else:
            qs = EquipmentDataset.objects.all()[:5]
        return Response(EquipmentDatasetSerializer(qs, many=True).data)

class DataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dataset_id = request.query_params.get('id')

        # Build candidate list: requested dataset first (if any), otherwise all for this user
        candidates = []
        if dataset_id:
            ds = EquipmentDataset.objects.filter(id=dataset_id, user=request.user).first()
            if not ds:
                return Response({'error': 'Dataset not found'}, status=404)
            candidates.append(ds)
        else:
            candidates = list(EquipmentDataset.objects.filter(user=request.user))

        # Find the most recent candidate that contains numeric Flowrate or Pressure
        for dataset in candidates:
            abs_path = os.path.join(settings.MEDIA_ROOT, dataset.csv_file.name)
            try:
                df = pd.read_csv(abs_path)
            except Exception:
                continue
            cols = [c.strip() for c in df.columns]
            if any(c.lower() in ('flowrate', 'flow rate', 'flow_rate') for c in cols) or any(c.lower() in ('pressure',) for c in cols):
                df.columns = cols
                records = []
                for idx, row in df.iterrows():
                    records.append({
                        'id': idx,
                        'equipmentName': row.get('Equipment Name') or row.get('Equipment') or row.get('Name') or '',
                        'type': row.get('Type') or '',
                        'flowrate': None if pd.isna(row.get('Flowrate')) else float(row.get('Flowrate')),
                        'pressure': None if pd.isna(row.get('Pressure')) else float(row.get('Pressure')),
                        'temperature': None if pd.isna(row.get('Temperature')) else float(row.get('Temperature')),
                    })
                return Response(records)
        return Response({'error': 'No dataset with numeric parameters found'}, status=404)

class PDFReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Generate a PDF from the latest dataset summary for this user
        latest = EquipmentDataset.objects.filter(user=request.user).first()
        if not latest:
            return Response({'error': 'No data'}, status=404)
        # Create PDF in memory
        from io import BytesIO
        buffer = BytesIO()
        c = canvas.Canvas(buffer)
        c.setFont("Helvetica", 12)
        c.drawString(100, 800, f"Equipment Data Report: {latest.file_name}")
        y = 780
        for k, v in latest.summary.items():
            c.drawString(100, y, f"{k}: {v}")
            y -= 20
            if y < 100:
                c.showPage()
                y = 800
        c.save()
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename='equipment-report.pdf')

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if not username or not email or not password:
            return Response({'error': 'username, email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({'username': user.username, 'email': user.email}, status=status.HTTP_201_CREATED)

import base64
from django.contrib.auth import authenticate

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('username_or_email')
        password = request.data.get('password')
        if not identifier or not password:
            return Response({'error': 'username_or_email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        username = identifier
        # if looks like an email, try to resolve
        if '@' in identifier:
            try:
                user = User.objects.get(email__iexact=identifier)
                username = user.username
            except User.DoesNotExist:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        token = base64.b64encode(f"{username}:{password}".encode()).decode()
        return Response({'token': token, 'username': username})
#   A p p e n d   t o   v i e w s . p y   -   L o a d S a m p l e D a t a V i e w  
 #   A d d   t h i s   a t   t h e   e n d   o f   t h e   f i l e  
  
 @ m e t h o d _ d e c o r a t o r ( c s r f _ e x e m p t ,   n a m e = ' d i s p a t c h ' )  
 c l a s s   L o a d S a m p l e D a t a V i e w ( A P I V i e w ) :  
         p e r m i s s i o n _ c l a s s e s   =   [ A l l o w A n y ]  
  
         d e f   g e t ( s e l f ,   r e q u e s t ) :  
                 i m p o r t   o s  
                 f r o m   d j a n g o . c o n f   i m p o r t   s e t t i n g s  
                  
                 #   L o a d   s a m p l e   C S V   f r o m   r o o t   o f   d j a n g o b a c k e n d  
                 s a m p l e _ p a t h   =   o s . p a t h . j o i n ( s e t t i n g s . B A S E _ D I R ,   ' . . ' ,   ' s a m p l e _ e q u i p m e n t _ d a t a . c s v ' )  
                  
                 t r y :  
                         d f   =   p d . r e a d _ c s v ( s a m p l e _ p a t h )  
                         #   R e t u r n   s u m m a r y   l i k e   t h e   u p l o a d   e n d p o i n t   d o e s  
                         s u m m a r y   =   s e l f . _ g e t _ s u m m a r y ( d f )  
                         r e t u r n   R e s p o n s e ( {  
                                 ' m e s s a g e ' :   ' S a m p l e   d a t a   l o a d e d ' ,  
                                 ' t o t a l C o u n t ' :   l e n ( d f ) ,  
                                 ' s u m m a r y ' :   s u m m a r y ,  
                                 ' d a t a ' :   d f . t o _ d i c t ( ' r e c o r d s ' )  
                         } ,   s t a t u s = s t a t u s . H T T P _ 2 0 0 _ O K )  
                 e x c e p t   E x c e p t i o n   a s   e :  
                         r e t u r n   R e s p o n s e ( { ' e r r o r ' :   f ' F a i l e d   t o   l o a d   s a m p l e   d a t a :   { s t r ( e ) } ' } ,   s t a t u s = s t a t u s . H T T P _ 4 0 0 _ B A D _ R E Q U E S T )  
          
         d e f   _ g e t _ s u m m a r y ( s e l f ,   d f ) :  
                 d e f   f i n d _ c o l ( k e y ) :  
                         f o r   c   i n   d f . c o l u m n s :  
                                 i f   c . l o w e r ( )   = =   k e y . l o w e r ( ) :  
                                         r e t u r n   d f [ c ]  
                         r e t u r n   N o n e  
                  
                 f l o w   =   f i n d _ c o l ( ' F l o w r a t e ' )  
                 p r e s s u r e   =   f i n d _ c o l ( ' P r e s s u r e ' )  
                 t e m p   =   f i n d _ c o l ( ' T e m p e r a t u r e ' )  
                 t y p   =   f i n d _ c o l ( ' T y p e ' )  
                  
                 r e t u r n   {  
                         ' t o t a l C o u n t ' :   l e n ( d f ) ,  
                         ' a v g F l o w r a t e ' :   f l o a t ( f l o w . m e a n ( ) )   i f   f l o w   i s   n o t   N o n e   a n d   n o t   f l o w . e m p t y   e l s e   N o n e ,  
                         ' a v g P r e s s u r e ' :   f l o a t ( p r e s s u r e . m e a n ( ) )   i f   p r e s s u r e   i s   n o t   N o n e   a n d   n o t   p r e s s u r e . e m p t y   e l s e   N o n e ,  
                         ' a v g T e m p e r a t u r e ' :   f l o a t ( t e m p . m e a n ( ) )   i f   t e m p   i s   n o t   N o n e   a n d   n o t   t e m p . e m p t y   e l s e   N o n e ,  
                         ' t y p e D i s t r i b u t i o n ' :   t y p . v a l u e _ c o u n t s ( ) . t o _ d i c t ( )   i f   t y p   i s   n o t   N o n e   e l s e   { } ,  
                         ' m i n F l o w r a t e ' :   f l o a t ( f l o w . m i n ( ) )   i f   f l o w   i s   n o t   N o n e   a n d   n o t   f l o w . e m p t y   e l s e   N o n e ,  
                         ' m a x F l o w r a t e ' :   f l o a t ( f l o w . m a x ( ) )   i f   f l o w   i s   n o t   N o n e   a n d   n o t   f l o w . e m p t y   e l s e   N o n e ,  
                         ' m i n P r e s s u r e ' :   f l o a t ( p r e s s u r e . m i n ( ) )   i f   p r e s s u r e   i s   n o t   N o n e   a n d   n o t   p r e s s u r e . e m p t y   e l s e   N o n e ,  
                         ' m a x P r e s s u r e ' :   f l o a t ( p r e s s u r e . m a x ( ) )   i f   p r e s s u r e   i s   n o t   N o n e   a n d   n o t   p r e s s u r e . e m p t y   e l s e   N o n e ,  
                         ' m i n T e m p e r a t u r e ' :   f l o a t ( t e m p . m i n ( ) )   i f   t e m p   i s   n o t   N o n e   a n d   n o t   t e m p . e m p t y   e l s e   N o n e ,  
                         ' m a x T e m p e r a t u r e ' :   f l o a t ( t e m p . m a x ( ) )   i f   t e m p   i s   n o t   N o n e   a n d   n o t   t e m p . e m p t y   e l s e   N o n e ,  
                 }  
 