# Generated by Django 5.0.2 on 2024-07-25 14:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Chemical',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('active_ingredient', models.CharField(max_length=100)),
                ('purchase_date', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='Treatment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plant', models.CharField(max_length=100)),
                ('illness', models.CharField(max_length=100)),
                ('treatment_date', models.DateField()),
                ('chemical', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chemical_tracker.chemical')),
            ],
        ),
    ]
