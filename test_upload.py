import requests

# Test CSV upload endpoint
test_csv_content = """Type,Flowrate,Pressure,Temperature
Pump,100.5,50.2,75.3
Valve,80.1,45.7,72.1
Filter,120.3,55.8,78.9"""

# Create a test file
with open('test_sample.csv', 'w') as f:
    f.write(test_csv_content)

# Test upload without authentication first
try:
    with open('test_sample.csv', 'rb') as f:
        response = requests.post(
            'http://127.0.0.1:8000/api/upload/',
            files={'file': f},
            timeout=10
        )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")

# Test upload with authentication
try:
    # First get auth token
    login_response = requests.post(
        'http://127.0.0.1:8000/api/login/',
        json={'username_or_email': 'admin', 'password': 'admin123'},
        timeout=10
    )
    
    if login_response.status_code == 200:
        token = login_response.json().get('token')
        print(f"Login successful. Token: {token}")
        
        # Now try upload with auth
        with open('test_sample.csv', 'rb') as f:
            response = requests.post(
                'http://127.0.0.1:8000/api/upload/',
                files={'file': f},
                headers={'Authorization': f'Basic {token}'},
                timeout=10
            )
        
        print(f"Auth Upload Status Code: {response.status_code}")
        print(f"Auth Upload Response: {response.text}")
    else:
        print(f"Login failed: {login_response.status_code} - {login_response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"Auth Request Error: {e}")