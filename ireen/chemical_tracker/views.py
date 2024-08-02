from django.shortcuts import render, redirect,get_object_or_404
from .models import Chemical,Recommendation, Treatment,TreatmentProgress,FinalResult
from .forms import ChemicalForm,RecommendationForm, TreatmentForm,TreatmentProgressForm,FinalResultForm

from django.db.models import Count, Case, When, IntegerField, FloatField, F


def index(request):
    # Retrieve all chemicals and treatments from the database
    chemicals = Chemical.objects.all()
    
    # Render the index page with the retrieved chemicals and treatments
    return render(request, 'chemical_tracker/index.html', {'chemicals': chemicals})

def chemical_detail(request, pk):
    # Retrieve the chemical with the specified primary key (pk)
    chemical = Chemical.objects.get(pk=pk)
    # Render the chemical detail page with the retrieved chemical
    return render(request, 'chemical_tracker/chemical_detail.html', {'chemical': chemical})

def add_chemical(request):
    if request.method == 'POST':
        # Create a form instance with the POST data
        form = ChemicalForm(request.POST)
        if form.is_valid():
            # Save the form and redirect to the chemical list
            form.save()
            return redirect('chemicaltracker:chemicalT')
    else:
        # Create an empty form instance
        form = ChemicalForm()
    # Render the add chemical page with the form
    return render(request, 'chemical_tracker/add_chemical.html', {'form': form})

def update_chemical(request, pk):
    # Retrieve the chemical with the specified primary key (pk)
    chemical = Chemical.objects.get(pk=pk)
    if request.method == 'POST':
        # Create a form instance with the POST data and the retrieved chemical
        form = ChemicalForm(request.POST, instance=chemical)
        if form.is_valid():
            # Save the form and redirect to the chemical detail page
            form.save()
            return redirect('chemical_detail', pk=chemical.pk)
    else:
        # Create a form instance with the retrieved chemical
        form = ChemicalForm(instance=chemical)
    # Render the update chemical page with the form
    return render(request, 'chemical_tracker/update_chemical.html', {'form': form})



def add_recommendation(request):
    if request.method == 'POST':
        # Create a form instance with the POST data
        form = RecommendationForm(request.POST)
        if form.is_valid():
            # Save the form and redirect to the chemical list
            form.save()
            return redirect('chemicaltracker:chemicalT')
    else:
        # Create an empty form instance
        form = RecommendationForm()
    # Render the add recommendation page with the form
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
            success_rate=F('success_count') * 100 / F('total_count'),
            minor_result_rate=F('minor_result_count') * 100 / F('total_count'),
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

    # Render the suggestions page with the merged details
    return render(request, 'chemical_tracker/suggest_chemical_applications.html', {'suggestions': suggestions_with_details})

def add_treatment(request):
    if request.method == 'POST':
        form = TreatmentForm(request.POST)
        if form.is_valid():
            treatment = form.save()
            # Create default progress entry for day 1
            TreatmentProgress.objects.create(
                treatment=treatment,
                date=treatment.treatment_date,  # or you might want to set it to today's date
                details='first treatment.'
            )
            return redirect('chemicaltracker:plant_details', plant_name=treatment.plant)
    else:
        form = TreatmentForm()
    return render(request, 'chemical_tracker/add_treatment.html', {'form': form})

def view_treatments(request):
    treatments = Treatment.objects.all()
    plants = treatments.values_list('plant', flat=True).distinct()
    return render(request, 'chemical_tracker/view_treat.html', {
        'treatments': treatments,
        'plants': plants,
    })
 


def plant_details(request, plant_name):
    treatments = Treatment.objects.filter(plant=plant_name)
    treatment_progress = TreatmentProgress.objects.filter(treatment__in=treatments).order_by('date')

    progress_form = TreatmentProgressForm()
    final_result_form = FinalResultForm()

    if request.method == 'POST':
        if 'progress_form' in request.POST:
            progress_form = TreatmentProgressForm(request.POST)
            if progress_form.is_valid():
                progress = progress_form.save(commit=False)
                progress.treatment = treatments.first() if treatments.exists() else None
                if progress.treatment:
                    progress.save()
                    return redirect('chemicaltracker:plant_details', plant_name=plant_name)
        elif 'final_result_form' in request.POST:
            final_result_form = FinalResultForm(request.POST)
            if final_result_form.is_valid():
                treatment = treatments.first() if treatments.exists() else None
                if treatment:
                    final_result, created = FinalResult.objects.get_or_create(treatment=treatment)
                    final_result.date = final_result_form.cleaned_data['date']
                    final_result.observation = final_result_form.cleaned_data['observation']
                    result_value = final_result_form.cleaned_data['result']
                    
                    # Clear other outcome fields and set the appropriate one
                    final_result.success = (result_value == 'success')
                    final_result.minor_result = (result_value == 'minor_result')
                    final_result.failed = (result_value == 'failed')
                    
                    final_result.save()
                    return redirect('chemicaltracker:plant_details', plant_name=plant_name)

    final_result = FinalResult.objects.filter(treatment__in=treatments).first()

    return render(request, 'chemical_tracker/plant_details.html', {
        'plant': plant_name,
        'treatments': treatments,
        'treatment_progress': treatment_progress,
        'final_result': final_result,
        'progress_form': progress_form,
        'final_result_form': final_result_form
    })