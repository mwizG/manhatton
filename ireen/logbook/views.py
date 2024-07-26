from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Expense, Sale, Tip
from .forms import ExpenseForm, SaleForm

@login_required
def logbook_home(request):
    expenses = Expense.objects.filter(user=request.user)
    sales = Sale.objects.filter(user=request.user)
    return render(request, 'logbook/index.html', {'expenses': expenses, 'sales': sales})

@login_required
def add_expense(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.user = request.user
            expense.save()
            return redirect('logbook_home')
    else:
        form = ExpenseForm()
    return render(request, 'logbook/add_expense.html', {'form': form})

@login_required
def add_sale(request):
    if request.method == 'POST':
        form = SaleForm(request.POST)
        if form.is_valid():
            sale = form.save(commit=False)
            sale.user = request.user
            sale.save()
            return redirect('logbook_home')
    else:
        form = SaleForm()
    return render(request, 'logbook/add_sale.html', {'form': form})
