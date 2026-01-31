import requests
import json

# Test the login endpoint
try:
    response = requests.post('http://127.0.0.1:8000/api/login/', json={
        'username_or_email': 'admin',
        'password': 'admin123'
    })
    
    print(f"Login Status Code: {response.status_code}")
    print(f"Login Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"Auth Token: {token}")
        
        # Test a protected endpoint with the token
        test_response = requests.get('http://127.0.0.1:8000/api/summary/', 
                                   headers={'Authorization': f'Basic {token}'})
        print(f"Summary Status Code: {test_response.status_code}")
        print(f"Summary Response: {test_response.text}")
    
except Exception as e:
    print(f"Error: {e}")