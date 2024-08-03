from django.shortcuts import render, redirect, get_object_or_404
from .models import Chemical, Recommendation, Treatment, TreatmentProgress, FinalResult
from .forms import ChemicalForm, RecommendationForm, TreatmentForm, TreatmentProgressForm, FinalResultForm
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Case, When, IntegerField, FloatField, F
from django.db.models import Q
def index(request):
    chemicals = Chemical.objects.all()
    return render(request, 'chemical_tracker/index.html', {'chemicals': chemicals})


def index(request):
    # Show all chemicals if the user is an admin, otherwise show only their own chemicals and chemicals added by admins
    if request.user.is_staff:
        chemicals = Chemical.objects.all()
    else:
        chemicals = Chemical.objects.filter(Q(user=request.user) | Q(user__is_staff=True))
    
    return render(request, 'chemical_tracker/index.html', {'chemicals': chemicals})


@login_required
def chemical_detail(request, pk):
    chemical = get_object_or_404(Chemical, pk=pk)
    return render(request, 'chemical_tracker/chemical_detail.html', {'chemical': chemical})



@login_required
def add_chemical(request):
    if request.method == 'POST':
        form = ChemicalForm(request.POST)
        if form.is_valid():
            chemical = form.save(commit=False)
            chemical.user = request.user
            chemical.save()
            return redirect('chemicaltracker:chemicalT')
    else:
        form = ChemicalForm()
    return render(request, 'chemical_tracker/add_chemical.html', {'form': form})

@login_required
def update_chemical(request, pk):
    chemical = get_object_or_404(Chemical, pk=pk)
    if chemical.user != request.user:
        return redirect('chemicaltracker:chemicalT')  # Handle unauthorized access
    if request.method == 'POST':
        form = ChemicalForm(request.POST, instance=chemical)
        if form.is_valid():
            form.save()
            return redirect('chemicaltracker:chemical_detail', pk=chemical.pk)
    else:
        form = ChemicalForm(instance=chemical)
    return render(request, 'chemical_tracker/update_chemical.html', {'form': form})



@login_required
def add_recommendation(request):
    # Filter chemicals based on user type
    if request.user.is_staff:
        chemicals = Chemical.objects.all()
    else:
        chemicals = Chemical.objects.filter(Q(user=request.user) | Q(user__is_staff=True))
    
    if request.method == 'POST':
        form = RecommendationForm(request.POST)
        form.fields['chemical'].queryset = chemicals  # Filter the chemical field in the form
        if form.is_valid():
            recommendation = form.save(commit=False)
            recommendation.user = request.user
            recommendation.save()
            return redirect('chemicaltracker:chemicalT')
    else:
        form = RecommendationForm()
        form.fields['chemical'].queryset = chemicals  # Filter the chemical field in the form
    
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
    # Filter chemicals based on user type
    if request.user.is_staff:
        chemicals = Chemical.objects.all()
    else:
        chemicals = Chemical.objects.filter(Q(user=request.user) | Q(user__is_staff=True))
    
    if request.method == 'POST':
        form = TreatmentForm(request.POST)
        form.fields['chemical'].queryset = chemicals  # Filter the chemical field in the form
        if form.is_valid():
            treatment = form.save(commit=False)
            treatment.user = request.user
            treatment.save()
            TreatmentProgress.objects.create(
                user=request.user,
                treatment=treatment,
                date=treatment.treatment_date,
                details='first treatment.'
            )
            return redirect('chemicaltracker:plant_details', plant_name=treatment.plant)
    else:
        form = TreatmentForm()
        form.fields['chemical'].queryset = chemicals  # Filter the chemical field in the form
    
    return render(request, 'chemical_tracker/add_treatment.html', {'form': form})


@login_required
def view_treatments(request):
    treatments = Treatment.objects.filter(user=request.user)
    plants = treatments.values_list('plant', flat=True).distinct()
    return render(request, 'chemical_tracker/view_treat.html', {
        'treatments': treatments,
        'plants': plants,
    })


import logging

logger = logging.getLogger(__name__)

@login_required
def plant_details(request, plant_name):
    treatments = Treatment.objects.filter(plant=plant_name, user=request.user)
    treatment_progress = TreatmentProgress.objects.filter(treatment__in=treatments, user=request.user).order_by('date')
    
    progress_form = TreatmentProgressForm()
    final_result_form = FinalResultForm()
    
    if request.method == 'POST':
        if 'progress_form' in request.POST:
            progress_form = TreatmentProgressForm(request.POST)
            if progress_form.is_valid():
                progress = progress_form.save(commit=False)
                progress.user = request.user
                progress.treatment = treatments.first() if treatments.exists() else None
                if progress.treatment:
                    progress.save()
                    return redirect('chemicaltracker:plant_details', plant_name=plant_name)
            else:
                # Debug: Print form errors
                logger.debug("Progress form errors: %s", progress_form.errors)
        elif 'final_result_form' in request.POST:
            final_result_form = FinalResultForm(request.POST)
            if final_result_form.is_valid():
                treatment = treatments.first() if treatments.exists() else None
                if treatment:
                    final_result, created = FinalResult.objects.get_or_create(
                        treatment=treatment,
                        user=request.user,
                        defaults={
                            'date': final_result_form.cleaned_data['date'],
                            'observation': final_result_form.cleaned_data['observation'],
                            'success': final_result_form.cleaned_data['result'] == 'success',
                            'minor_result': final_result_form.cleaned_data['result'] == 'minor_result',
                            'failed': final_result_form.cleaned_data['result'] == 'failed'
                        }
                    )
                    if not created:  # If not created, update the existing instance
                        final_result.date = final_result_form.cleaned_data['date']
                        final_result.observation = final_result_form.cleaned_data['observation']
                        final_result.success = final_result_form.cleaned_data['result'] == 'success'
                        final_result.minor_result = final_result_form.cleaned_data['result'] == 'minor_result'
                        final_result.failed = final_result_form.cleaned_data['result'] == 'failed'
                        final_result.save()
                    return redirect('chemicaltracker:plant_details', plant_name=plant_name)
            else:
                # Debug: Print form errors
                logger.debug("Final result form errors: %s", final_result_form.errors)
    
    final_result = FinalResult.objects.filter(treatment__in=treatments, user=request.user).first()
    
    return render(request, 'chemical_tracker/plant_details.html', {
        'plant': plant_name,
        'treatments': treatments,
        'treatment_progress': treatment_progress,
        'final_result': final_result,
        'progress_form': progress_form,
        'final_result_form': final_result_form
    })

