from django.shortcuts import render
from .models import CropSuggestion, SoilCondition

def planting_suggestions(request):
    suggestions = CropSuggestion.objects.all()
    return render(request, 'planting/suggestions.html', {'suggestions': suggestions})
