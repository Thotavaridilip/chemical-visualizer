from django.test import TestCase
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


class EquipmentAPITests(APITestCase):
    def test_history_returns_200(self):
        """History endpoint should be reachable and return 200."""
        resp = self.client.get('/api/history/')
        self.assertEqual(resp.status_code, 200)

    def test_upload_accepts_csv(self):
        """Upload endpoint should accept a small CSV file and respond 200/201.

        The upload view requires authentication in this project, so create a
        test user and force-authenticate the test client before posting.
        """
        User = get_user_model()
        user = User.objects.create_user(username='testuser', email='test@example.com', password='pass')
        client = APIClient()
        # Use HTTP Basic auth header for authentication
        import base64
        token = base64.b64encode(b"testuser:pass").decode('ascii')
        client.credentials(HTTP_AUTHORIZATION='Basic ' + token)

        # Provide the columns expected by the view's summary routine
        csv = (
            b"Flowrate,Pressure,Temperature,Type\n"
            b"10,1.2,25,A\n"
            b"20,1.3,26,B\n"
        )
        f = SimpleUploadedFile('test.csv', csv, content_type='text/csv')
        resp = client.post('/api/upload/', {'file': f}, format='multipart')
        print('TEST_RESP_STATUS:', resp.status_code)
        try:
            print('TEST_RESP_DATA:', resp.data)
        except Exception:
            print('TEST_RESP_CONTENT:', resp.content[:200])
        self.assertIn(resp.status_code, (200, 201))
