from django.db import migrations
import os


def delete_existing_datasets(apps, schema_editor):
    EquipmentDataset = apps.get_model('equipment', 'EquipmentDataset')
    # Delete files from MEDIA_ROOT and then delete DB rows
    from django.conf import settings

    for ds in EquipmentDataset.objects.all():
        try:
            if ds.csv_file:
                path = os.path.join(settings.MEDIA_ROOT, ds.csv_file.name)
                if os.path.exists(path):
                    os.remove(path)
        except Exception:
            pass

    # Clean up any tmp preview files
    try:
        tmp_dir = os.path.join(settings.MEDIA_ROOT, 'tmp')
        if os.path.isdir(tmp_dir):
            for f in os.listdir(tmp_dir):
                try:
                    os.remove(os.path.join(tmp_dir, f))
                except Exception:
                    pass
    except Exception:
        pass

    EquipmentDataset.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0002_equipmentdataset_user'),
    ]

    operations = [
        migrations.RunPython(delete_existing_datasets),
    ]
