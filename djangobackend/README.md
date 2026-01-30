# Chemical Equipment Parameter Visualizer

[![Backend Tests](https://github.com/Thotavaridilip/MyDailyworks/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/Thotavaridilip/MyDailyworks/actions/workflows/backend-tests.yml) [![Frontend CI](https://github.com/Thotavaridilip/MyDailyworks/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Thotavaridilip/MyDailyworks/actions/workflows/frontend-ci.yml)

A hybrid **Web + Desktop** application for visualizing and analyzing chemical equipment data from CSV files.

---

## 📋 Project Overview

This project allows users to upload a CSV file containing chemical equipment parameters (Equipment Name, Type, Flowrate, Pressure, Temperature). The Django backend parses the data, performs analysis, and provides summary statistics via REST API. Both the React (Web) and PyQt5 (Desktop) frontends consume this API to display data tables, charts, and summaries.

---

## 🏗️ Project Structure

```
chemical-equipment-visualizer/
├── backend/                 # Django REST API
│   ├── core/               # Django project settings
│   ├── equipment/          # Equipment app with API endpoints
│   ├── media/              # Uploaded files storage
│   └── requirements.txt    # Python dependencies
├── frontend/               # React web application
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components (CSVUploader, Charts, etc.)
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components (Dashboard, Login)
│   │   └── types/         # TypeScript types
│   └── package.json       # Node dependencies
├── desktop/                # PyQt5 desktop application
│   ├── main.py            # Main desktop application
│   └── requirements.txt   # Python dependencies
└── sample_equipment_data.csv  # Sample data for testing
```

---

## ✨ Features

| Feature | Web (React) | Desktop (PyQt5) | Backend (Django) |
|---------|-------------|-----------------|------------------|
| CSV Upload | ✅ | ✅ | ✅ POST `/api/upload/` |
| Data Summary | ✅ | ✅ | ✅ GET `/api/summary/` |
| Charts/Visualization | ✅ Chart.js | ✅ Matplotlib | - |
| Upload History (last 5) | ✅ | ✅ | ✅ GET `/api/history/` |
| PDF Report Generation | ✅ | ✅ | ✅ GET `/api/report/` |
| Basic Authentication | ✅ | ✅ | ✅ HTTP Basic Auth |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend (Web) | React.js + Chart.js (`react-chartjs-2`) + Tailwind CSS | Interactive charts and tables |
| Frontend (Desktop) | PyQt5 + Matplotlib | Desktop visualization |
| Backend | Python Django + Django REST Framework | Common REST API |
| Data Handling | Pandas | CSV parsing and analytics |
| Database | SQLite | Store last 5 uploaded datasets |
| PDF Generation | ReportLab | Generate PDF reports |
| Version Control | Git & GitHub | Collaboration & submission |

> **Note:** The web frontend uses **Chart.js** (via `react-chartjs-2`) for the main dashboard charts. Some utility chart components still use Recharts.

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+ 
- Node.js 18+ and npm (or Bun)
- Git

---

### 1. Backend (Django)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create admin user for authentication
python manage.py createsuperuser
# Recommended: username=admin, password=admin123

# Start the Django server
python manage.py runserver 8000
```

The backend API will be available at: `http://localhost:8000/api/`

---

### 2. Frontend (React Web App)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The React app will be available at: `http://localhost:5173/`

#### Production Build
```bash
npm run build
```
The built files will be in `frontend/dist/` and can be served by Django at `http://localhost:8000/`.

---

### 3. Desktop (PyQt5 App)

```bash
# Navigate to desktop directory
cd desktop

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Make sure Django backend is running on http://localhost:8000

# Run the desktop application
python main.py
```

---

## 🔌 API Endpoints

All endpoints require **Basic Authentication**.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/` | Upload CSV file | ✅ Yes |
| GET | `/api/summary/` | Get latest summary statistics | ✅ Yes |
| GET | `/api/history/` | Get last 5 upload records | ✅ Yes |
| GET | `/api/report/` | Download PDF report | ✅ Yes |

### Authentication
Use HTTP Basic Authentication with your Django superuser credentials:
- **Username:** `admin`
- **Password:** `admin123` (or whatever you set during `createsuperuser`)

Example with curl:
```bash
curl -u admin:admin123 http://localhost:8000/api/summary/
```

> **Security note:** This project uses HTTP Basic authentication with a base64-encoded token for demo convenience only. For production deployments, use stronger authentication (for example, JWTs, OAuth2 or session-based auth), always serve the API over HTTPS, and avoid embedding credentials in scripts or version control.

---

## 📊 Sample Data

Use the provided `sample_equipment_data.csv` file to test the application. It contains sample chemical equipment data with columns:

| Column | Description | Example |
|--------|-------------|---------|
| Equipment Name | Name of the equipment | Pump-001 |
| Type | Equipment type | Pump, Valve, Tank, Heat Exchanger |
| Flowrate | Flow rate in L/min or m³/h | 150.5 |
| Pressure | Pressure in bar | 4.2 |
| Temperature | Temperature in °C | 85.0 |

---

## 🎯 Usage Guide

### Web Application
1. Open `http://localhost:5173/` (dev) or `http://localhost:8000/` (production build)
2. Login with admin credentials
3. Upload the sample CSV file or drag-and-drop
4. View summary statistics and interactive charts
5. Check upload history
6. Download PDF report

### Desktop Application
1. Start the Django backend first
2. Run `python main.py` in the desktop folder
3. Login with admin credentials
4. Upload CSV, view charts (Matplotlib), and download reports

---

## 📁 Key Files

### Backend
- `backend/equipment/views.py` - API views for upload, summary, history, PDF
- `backend/equipment/models.py` - EquipmentDataset model
- `backend/core/settings.py` - Django settings, CORS config

### Frontend
- `frontend/src/api/equipmentApi.ts` - API client functions
- `frontend/src/components/CSVUploader.tsx` - File upload component
- `frontend/src/components/EquipmentCharts.tsx` - Chart.js visualizations
- `frontend/src/pages/Dashboard.tsx` - Main dashboard page

### Desktop
- `desktop/main.py` - Complete PyQt5 application with Matplotlib charts

---

## 🔧 Development Notes

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8080`, `http://localhost:8081`
- `http://localhost:3000`

### Database
SQLite is used for simplicity. The database file is at `backend/db.sqlite3`.

### History Management
The system automatically keeps only the **last 5 uploaded datasets**. Older records are deleted automatically.

---

## 📦 Dependencies

### Backend (`backend/requirements.txt`)
- Django 6.x
- djangorestframework
- django-cors-headers
- pandas
- reportlab (PDF generation)

### Frontend (`frontend/package.json`)
- React 18
- Chart.js (chart.js + react-chartjs-2)
- Tailwind CSS
- Axios
- TypeScript

### Desktop (`desktop/requirements.txt`)
- PyQt5
- matplotlib
- pandas
- requests

---

## 📹 Demo

A 2-3 minute demo video should demonstrate:
1. Starting the backend server
2. Web app: Login → Upload CSV → View charts → Download PDF
3. Desktop app: Login → Upload CSV → View Matplotlib charts → Download PDF
4. History management (upload multiple files, see last 5)

If you have a demo video, add it to `Videos/demo.mp4` (or provide a hosted link) and link it here: [Demo video](Videos/demo.mp4)

---

## 📝 License

This project is for educational/internship screening purposes.

---

## 👤 Author

**Thotavari Dilip**

- GitHub: [@Thotavaridilip](https://github.com/Thotavaridilip)
- Repository: [MyDailyworks](https://github.com/Thotavaridilip/MyDailyworks)

---

## 🚀 Deploying to Neon (Postgres)

If you'd like to run the backend against Neon (managed Postgres), follow these quick steps:

1. Create a Neon project and copy the `DATABASE_URL` (ensure `?sslmode=require` is present).
2. Set the following environment variables on your host service (Render/Fly/Railway/Heroku):
   - `DATABASE_URL` (Neon connection string)
   - `SECRET_KEY`
   - `DEBUG=false`
   - `ALLOWED_HOSTS=yourdomain.com`
3. Install the extra requirements: `psycopg2-binary`, `dj-database-url`, and `whitenoise` (already added to `backend/requirements.txt`).
4. Run migrations and create a superuser on the new DB:
```bash
python manage.py migrate
python manage.py createsuperuser
```
5. Collect static files and run your production server (example: Gunicorn):
```bash
python manage.py collectstatic --noinput
gunicorn core.wsgi --workers 3
```

See `backend/DEPLOYMENT.md` for a longer checklist and tips.
