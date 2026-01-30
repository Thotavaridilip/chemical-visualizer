from django.db import models

class EquipmentDataset(models.Model):
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    record_count = models.IntegerField()
    summary = models.JSONField()
    csv_file = models.FileField(upload_to='datasets/')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.file_name
