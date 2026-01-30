from django.contrib import admin
from .models import EquipmentDataset

@admin.register(EquipmentDataset)
class EquipmentDatasetAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'uploaded_at', 'record_count')
    readonly_fields = ('uploaded_at', 'summary')
