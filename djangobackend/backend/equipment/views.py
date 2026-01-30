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
