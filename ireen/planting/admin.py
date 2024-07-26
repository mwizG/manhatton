from django.contrib import admin

# Register your models here.
from .models import SoilCondition,CropSuggestion

admin.site.register(SoilCondition)
admin.site.register(CropSuggestion)
