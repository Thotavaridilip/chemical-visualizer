import os
import requests


BASE = "http://127.0.0.1:8000/api/"


def post_upload():
    here = os.path.dirname(__file__)
    sample = os.path.normpath(os.path.join(here, '..', '..', 'sample_equipment_data.csv'))
    if not os.path.exists(sample):
        sample = os.path.normpath(os.path.join(here, '..', '..', '..', 'sample_equipment_data.csv'))
    print('Using sample file:', sample)
    with open(sample, 'rb') as f:
        files = {'file': ('sample_equipment_data.csv', f)}
        r = requests.post(BASE + 'upload/', files=files)
    print('POST /api/upload/ ->', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text[:200])
    return r


def get_summary():
    r = requests.get(BASE + 'summary/')
    print('GET /api/summary/ ->', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text[:200])
    return r


def get_history():
    r = requests.get(BASE + 'history/')
    print('GET /api/history/ ->', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text[:200])
    return r


def get_report():
    r = requests.get(BASE + 'report/')
    print('GET /api/report/ ->', r.status_code)
    if r.status_code == 200:
        out = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'equipment-report-from-test.pdf'))
        with open(out, 'wb') as f:
            f.write(r.content)
        print('Saved PDF to', out)
    else:
        print(r.text[:200])
    return r


if __name__ == '__main__':
    post_upload()
    get_summary()
    get_history()
    get_report()
