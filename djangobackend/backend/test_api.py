import requests

# Test health check
try:
    response = requests.get('http://127.0.0.1:8000/api/health/')
    print(f'Health check status: {response.status_code}')
    print(f'Response: {response.text}')
except Exception as e:
    print(f'Health check error: {e}')

# Test upload endpoint with sample file
try:
    with open('../sample_equipment_data.csv', 'rb') as f:
        files = {'file': f}
        response = requests.post('http://127.0.0.1:8000/api/upload/', files=files)
        print(f'Upload status: {response.status_code}')
        print(f'Upload response: {response.text}')
except Exception as e:
    print(f'Upload error: {e}')