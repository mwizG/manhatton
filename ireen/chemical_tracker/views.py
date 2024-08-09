from django.shortcuts import render, redirect, get_object_or_404
from .models import Chemical, Recommendation, Treatment, TreatmentProgress, FinalResult
from .forms import ChemicalForm, RecommendationForm, TreatmentForm, TreatmentProgressForm, FinalResultForm
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Case, When, IntegerField, FloatField, F
from django.db.models import Q


def index(request):
    # Show all chemicals if the user is an admin, otherwise show only their own chemicals and chemicals added by admins
    if request.user.is_staff:
        chemicals = Chemical.objects.all()
    else:
        chemicals = Chemical.objects.filter(Q(user=request.user) | Q(user__is_staff=True))
    
    # Render the 'index.html' template with the filtered chemicals context
    return render(request, 'chemical_tracker/index.html', {'chemicals': chemicals})


@login_required
def chemical_detail(request, pk):
    # Retrieve a specific chemical by primary key (pk)
    chemical = get_object_or_404(Chemical, pk=pk)
    # Render the 'chemical_detail.html' template with the chemical context
    return render(request, 'chemical_tracker/chemical_detail.html', {'chemical': chemical})


@login_required
def add_chemical(request):
    # Check if the request method is POST
    if request.method == 'POST':
        # Create a form instance with POST data
        form = ChemicalForm(request.POST)
        # Validate the form
        if form.is_valid():
            # Save the form without committing to assign the user
            chemical = form.save(commit=False)
            # Assign the current user to the chemical
            chemical.user = request.user
            # Save the chemical to the database
            chemical.save()
            # Redirect to the chemical list page
            return redirect('chemicaltracker:chemicalT')
    else:
        # Create an empty form instance
        form = ChemicalForm()
    
    # Render the 'add_chemical.html' template with the form context
    return render(request, 'chemical_tracker/add_chemical.html', {'form': form})

@login_required
def update_chemical(request, pk):
    # Retrieve a specific chemical by primary key (pk)
    chemical = get_object_or_404(Chemical, pk=pk)
    # Check if the current user is the owner of the chemical
    if chemical.user != request.user:
        # Redirect to the chemical list page if unauthorized
        return redirect('chemicaltracker:chemicalT')
    if request.method == 'POST':
        # Create a form instance with POST data and the existing chemical instance
        form = ChemicalForm(request.POST, instance=chemical)
        # Validate the form
        if form.is_valid():
            # Save the updated chemical to the database
            form.save()
            # Redirect to the chemical detail page
            return redirect('chemicaltracker:chemical_detail', pk=chemical.pk)
    else:
        # Create a form instance with the existing chemical instance
        form = ChemicalForm(instance=chemical)
    
    # Render the 'update_chemical.html' template with the form context
    return render(request, 'chemical_tracker/update_chemical.html', {'form': form})


@login_required
def add_recommendation(request):
    # Filter chemicals based on user type
    if request.user.is_staff:
        chemicals = Chemical.objects.all()
    else:
        chemicals = Chemical.objects.filter(Q(user=request.user) | Q(user__is_staff=True))
    
    if request.method == 'POST':
        # Create a form instance with POST data
        form = RecommendationForm(request.POST)
        # Filter the chemical field in the form
        form.fields['chemical'].queryset = chemicals
        # Validate the form
        if form.is_valid():
            # Save the form without committing to assign the user
            recommendation = form.save(commit=False)
            # Assign the current user to the recommendation
            recommendation.user = request.user
            # Save the recommendation to the database
            recommendation.save()
            # Redirect to the chemical list page
            return redirect('chemicaltracker:chemicalT')
    else:
        # Create an empty form instance
        form = RecommendationForm()
        # Filter the chemical field in the form
        form.fields['chemical'].queryset = chemicals
    
    # Render the 'add_recommendation.html' template with the form context
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
        # Create a form instance with POST data
        form = TreatmentForm(request.POST)
        # Filter the chemical field in the form
        form.fields['chemical'].queryset = chemicals
        # Validate the form
        if form.is_valid():
            # Save the form without committing to assign the user
            treatment = form.save(commit=False)
            # Assign the current user to the treatment
            treatment.user = request.user
            # Save the treatment to the database
            treatment.save()
            # Create an initial treatment progress entry
            TreatmentProgress.objects.create(
                user=request.user,
                treatment=treatment,
                date=treatment.treatment_date,
                details='first treatment.'
            )
            # Redirect to the plant details page
            return redirect('chemicaltracker:plant_details', plant_name=treatment.plant)
    else:
        # Create an empty form instance
        form = TreatmentForm()
        # Filter the chemical field in the form
        form.fields['chemical'].queryset = chemicals
    
    # Render the 'add_treatment.html' template with the form context
    return render(request, 'chemical_tracker/add_treatment.html', {'form': form})


@login_required
def view_treatments(request):
    # Retrieve all treatments for the current user
    treatments = Treatment.objects.filter(user=request.user)
    # Retrieve distinct plant names from the treatments
    plants = treatments.values_list('plant', flat=True).distinct()
    # Render the 'view_treat.html' template with the treatments and plants context
    return render(request, 'chemical_tracker/view_treat.html', {
        'treatments': treatments,
        'plants': plants,
    })


@login_required
def plant_details(request, plant_name):
    # Retrieve all treatments for the specified plant and the current user
    treatments = Treatment.objects.filter(plant=plant_name, user=request.user)
    # Retrieve treatment progress entries for the treatments
    treatment_progress = TreatmentProgress.objects.filter(treatment__in=treatments, user=request.user).order_by('date')

    # Initialize the forms
    progress_form = TreatmentProgressForm()
    final_result_form = FinalResultForm()
    final_result_exists = False

    if request.method == 'POST':
        if 'progress_form' in request.POST:
            # Handle the treatment progress form submission
            progress_form = TreatmentProgressForm(request.POST)
            if progress_form.is_valid():
                # Save the progress entry without committing to assign the user and treatment
                progress = progress_form.save(commit=False)
                progress.user = request.user
                progress.treatment = treatments.first() if treatments.exists() else None
                if progress.treatment:
                    # Save the progress entry to the database
                    progress.save()
                    # Redirect to the plant details page
                    return redirect('chemicaltracker:plant_details', plant_name=plant_name)
        elif 'final_result_form' in request.POST:
            # Handle the final result form submission
            final_result_form = FinalResultForm(request.POST)
            if final_result_form.is_valid():
                treatment = treatments.first() if treatments.exists() else None
                if treatment:
                    # Get or create a final result entry
                    final_result, created = FinalResult.objects.get_or_create(
                        treatment=treatment,
                        defaults={
                            'user': request.user,
                            'date': final_result_form.cleaned_data['date'],
                            'observation': final_result_form.cleaned_data['observation'],
                            'success': final_result_form.cleaned_data['result'] == 'success',
                            'minor_result': final_result_form.cleaned_data['result'] == 'minor_result',
                            'failed': final_result_form.cleaned_data['result'] == 'failed'
                        }
                    )
                    if not created:
                        # Update the existing final result entry
                        final_result.user = request.user
                        final_result.date = final_result_form.cleaned_data['date']
                        final_result.observation = final_result_form.cleaned_data['observation']
                        result_value = final_result_form.cleaned_data['result']
                        final_result.success = (result_value == 'success')
                        final_result.minor_result = (result_value == 'minor_result')
                        final_result.failed = (result_value == 'failed')
                        final_result.save()
                    # Redirect to the plant details page
                    return redirect('chemicaltracker:plant_details', plant_name=plant_name)

    # Retrieve the final result entry if it exists
    final_result = FinalResult.objects.filter(treatment__in=treatments, user=request.user).first()
    final_result_exists = final_result is not None

    # Render the 'plant_details.html' template with the context
    return render(request, 'chemical_tracker/plant_details.html', {
        'plant': plant_name,
        'treatments': treatments,
        'treatment_progress': treatment_progress,
        'final_result': final_result,
        'final_result_exists': final_result_exists,
        'progress_form': progress_form,
        'final_result_form': final_result_form
    })
