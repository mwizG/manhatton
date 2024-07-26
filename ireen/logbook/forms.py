from django import forms
from .models import Expense, Sale

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['item', 'amount_spent', 'date']

class SaleForm(forms.ModelForm):
    class Meta:
        model = Sale
        fields = ['product', 'amount_earned', 'date']
