# chemical_tracker/admin.py
from django.contrib import admin
from .models import Chemical, Recommendation ,Treatment,TreatmentProgress

admin.site.register(Chemical)

admin.site.register(Recommendation)
admin.site.register(Treatment)
admin.site.register(TreatmentProgress)
