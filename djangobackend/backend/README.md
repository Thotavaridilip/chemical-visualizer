# Chemical Equipment Parameter Visualizer Backend

This Django project provides REST APIs for uploading, analyzing, and visualizing chemical equipment data from CSV files. It supports summary statistics, history of uploads, PDF report generation, and basic authentication.

## Features
- CSV upload and parsing (Pandas)
- Summary statistics (count, averages, type distribution)
- Store last 5 uploaded datasets (SQLite)
- PDF report generation
- Basic authentication

## Setup Instructions

1. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```sh
   python manage.py migrate
   ```
4. Start the server:
   ```sh
   python manage.py runserver
   ```

## API Endpoints
- `/api/upload/` : Upload CSV file
- `/api/summary/` : Get summary statistics
- `/api/history/` : Get last 5 uploads
- `/api/report/` : Generate PDF report

## Authentication
- Basic authentication is required for all endpoints.

---

For more details, see the code and comments.
