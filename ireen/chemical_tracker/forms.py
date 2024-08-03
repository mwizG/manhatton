# chemical_tracker/forms.py
from django import forms
from .models import Chemical, Recommendation, Treatment,TreatmentProgress,FinalResult

class ChemicalForm(forms.ModelForm):
    class Meta:
        model = Chemical
        fields = ['name', 'active_ingredient', 'usage_instructions', 'associated_products']

""" class ChemicalApplicationForm(forms.ModelForm):
    class Meta:
        model = ChemicalApplication
        fields = ['chemical', 'application_date', 'result', 'is_preventative']
        widgets = {
            'application_date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
        }
 """


class TreatmentForm(forms.ModelForm):
    class Meta:
      
        model = Treatment
        fields = ['chemical', 'plant', 'illness', 'treatment_date','is_preventative', 'duration_days', 'times_per_week']
        widgets = {
            'treatment_date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
        }

class TreatmentProgressForm(forms.ModelForm):
    class Meta:
        model = TreatmentProgress
        fields = ['date', 'details']
        widgets = {
            'date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
        }


class RecommendationForm(forms.ModelForm):
    RESULT_CHOICES = [
        ('success', 'Success'),
        ('minor_result', 'Minor Result'),
    ]
    
    result = forms.ChoiceField(
        choices=RESULT_CHOICES,
        widget=forms.RadioSelect
    )

    class Meta:
        model = Recommendation
        fields = ['chemical', 'recommended_date', 'reason', 'result', 'plant', 'illness']
        widgets = {
            'recommended_date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'}),
        }


class FinalResultForm(forms.ModelForm):
    RESULT_CHOICES = [
        ('success', 'Success'),
        ('minor_result', 'Minor Result'),
        ('failed', 'Failed')
    ]
    
    result = forms.ChoiceField(
        choices=RESULT_CHOICES,
        widget=forms.RadioSelect
    )
    
    class Meta:
        model = FinalResult
        fields = ['date', 'observation', 'result']
        widgets = {
            'date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
        }