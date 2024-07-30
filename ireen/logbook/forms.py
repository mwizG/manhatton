from django import forms
from .models import Expense, Sale

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['item', 'amount_spent', 'quantity', 'date']  # Added 'quantity'
        widgets = {
            'date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
        }

class SaleForm(forms.ModelForm):
    class Meta:
        model = Sale
        fields = ['product', 'amount_earned', 'quantity', 'date']  # Added 'quantity'
        widgets = {
            'date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})
        }
