# Generated by Django 5.0.2 on 2024-07-31 13:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chemical_tracker', '0003_recommendation_illness_recommendation_plant'),
    ]

    operations = [
        migrations.AddField(
            model_name='recommendation',
            name='minor_result',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='recommendation',
            name='success',
            field=models.BooleanField(default=False),
        ),
    ]
