from django.shortcuts import render, redirect
from .models import Chemical, ChemicalApplication, Recommendation, Treatment
from .forms import ChemicalForm, ChemicalApplicationForm, RecommendationForm, TreatmentForm

from django.db.models import Count, Case, When, IntegerField, FloatField, F

def index(request):
    chemicals = Chemical.objects.all()
    treatments = ChemicalApplication.objects.all()
    return render(request, 'chemical_tracker/index.html', {'chemicals': chemicals, 'treatments': treatments})

def chemical_detail(request, pk):
    chemical = Chemical.objects.get(pk=pk)
    return render(request, 'chemical_tracker/chemical_detail.html', {'chemical': chemical})

def add_chemical(request):
    if request.method == 'POST':
        form = ChemicalForm(request.POST)
        if form.is_valid():
            form.save()
            redirect('chemicaltracker:chemicalT')
    else:
        form = ChemicalForm()
    return render(request, 'chemical_tracker/add_chemical.html', {'form': form})

def update_chemical(request, pk):
    chemical = Chemical.objects.get(pk=pk)
    if request.method == 'POST':
        form = ChemicalForm(request.POST, instance=chemical)
        if form.is_valid():
            form.save()
            return redirect('chemical_detail', pk=chemical.pk)
    else:
        form = ChemicalForm(instance=chemical)
    return render(request, 'chemical_tracker/update_chemical.html', {'form': form})

def add_chemical_application(request):
    if request.method == 'POST':
        form = ChemicalApplicationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('chemicaltracker:chemicalT')
    else:
        form = ChemicalApplicationForm()
    return render(request, 'chemical_tracker/add_chemical_application.html', {'form': form})

def add_recommendation(request):
    if request.method == 'POST':
        form = RecommendationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('chemicaltracker:chemicalT')
    else:
        form = RecommendationForm()
    return render(request, 'chemical_tracker/add_recommendation.html', {'form': form})




def suggest_chemical_applications(request):
    # Calculate the total number of recommendations and categorize them
    suggestions = (
        Recommendation.objects
        .values('chemical', 'plant', 'illness')
        .annotate(
            total_count=Count('id'),
            success_count=Count(
                Case(
                    When(result='success', then=1),
                    output_field=IntegerField()
                )
            ),
            minor_result_count=Count(
                Case(
                    When(result='minor_result', then=1),
                    output_field=IntegerField()
                )
            ),
            success_rate=F('success_count') / F('total_count'),
            minor_result_rate=F('minor_result_count') / F('total_count'),
        )
        .order_by('-success_rate')  # Prioritize chemicals with higher success rate
    )

    # Retrieve detailed information about each suggested chemical
    chemical_ids = [suggestion['chemical'] for suggestion in suggestions]
    chemicals = Chemical.objects.filter(id__in=chemical_ids)

    # Merge detailed chemical info with the suggestions
    suggestions_with_details = [
        {
            **suggestion,
            'chemical': chemicals.get(id=suggestion['chemical']),
        }
        for suggestion in suggestions
    ]

    return render(request, 'chemical_tracker/suggest_chemical_applications.html', {'suggestions': suggestions_with_details})



def add_treatment(request):
    if request.method == 'POST':
        form = TreatmentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('chemicaltracker:chemicalT')
    else:
        form = TreatmentForm()
    return render(request, 'chemical_tracker/add_treatment.html', {'form': form})
