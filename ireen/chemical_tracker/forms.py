# chemical_tracker/forms.py
from django import forms
from .models import Chemical, ChemicalApplication, Recommendation, Treatment

class ChemicalForm(forms.ModelForm):
    class Meta:
        model = Chemical
        fields = ['name', 'active_ingredient', 'usage_instructions', 'associated_products']

class ChemicalApplicationForm(forms.ModelForm):
    class Meta:
        model = ChemicalApplication
        fields = ['chemical', 'application_date', 'result', 'is_preventative']
        widgets = {
            'application_date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
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


class TreatmentForm(forms.ModelForm):
    class Meta:
        model = Treatment
        fields = ['plant', 'illness', 'chemical', 'treatment_date']
        widgets = {
            'treatment_date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
        }
