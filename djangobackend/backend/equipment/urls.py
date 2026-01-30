from rest_framework import routers
from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.UploadCSVView.as_view(), name='upload-csv'),
    path('summary/', views.SummaryView.as_view(), name='summary'),
    path('history/', views.HistoryView.as_view(), name='history'),
    path('report/', views.PDFReportView.as_view(), name='pdf-report'),
]
