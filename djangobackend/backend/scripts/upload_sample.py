import requests
fpath = '../sample_equipment_data.csv'
with open(fpath, 'rb') as f:
    r = requests.post('http://127.0.0.1:8000/api/upload/', files={'file': f}, auth=('admin','admin123'))
    print(r.status_code)
    print(r.text)
