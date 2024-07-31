# chemical_tracker/admin.py
from django.contrib import admin
from .models import Chemical, ChemicalApplication, Recommendation

admin.site.register(Chemical)
admin.site.register(ChemicalApplication)
admin.site.register(Recommendation)
