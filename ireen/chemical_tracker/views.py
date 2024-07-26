from django.shortcuts import render
from .models import Chemical, Treatment

def index(request):
    chemicals = Chemical.objects.all()
    treatments = Treatment.objects.all()
    return render(request, 'chemical_tracker/index.html', {'chemicals': chemicals, 'treatments': treatments})
