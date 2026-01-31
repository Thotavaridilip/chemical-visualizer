from rest_framework import routers
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    path('health/', csrf_exempt(views.HealthCheckView.as_view()), name='health-check'),
    path('login/', csrf_exempt(views.LoginView.as_view()), name='login'),
    path('register/', csrf_exempt(views.RegisterView.as_view()), name='register'),
    path('load-sample/', csrf_exempt(views.LoadSampleDataView.as_view()), name='load-sample'),
    path('upload/', csrf_exempt(views.UploadCSVView.as_view()), name='upload-csv'),
    path('summary/', csrf_exempt(views.SummaryView.as_view()), name='summary'),
    path('history/', csrf_exempt(views.HistoryView.as_view()), name='history'),
    path('report/', csrf_exempt(views.PDFReportView.as_view()), name='pdf-report'),
]
