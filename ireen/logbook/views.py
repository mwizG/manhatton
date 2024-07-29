from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse
from .models import Expense, Sale
from .forms import ExpenseForm, SaleForm
import json


@login_required
def logbook_home(request):
    expenses = Expense.objects.filter(user=request.user)
    sales = Sale.objects.filter(user=request.user)

    # Calculate total spent and total earned
    total_spent = sum(expense.amount_spent for expense in expenses)
    total_earned = sum(sale.amount_earned for sale in sales)
    profit = total_earned - total_spent

    # Format values with currency symbol
    formatted_total_spent = f'k {total_spent:,.2f}'
    formatted_total_earned = f'K{total_earned:,.2f}'
    formatted_profit = f'K{profit:,.2f}'
    
    print('formatted:', formatted_profit)
    # Serialize data for Chart.js
    expense_data = json.dumps(list(expenses.values('date', 'amount_spent')), cls=DjangoJSONEncoder)
    sale_data = json.dumps(list(sales.values('date', 'amount_earned')), cls=DjangoJSONEncoder)

    return render(request, 'logbook/index.html', {
        'expenses': expenses,
        'sales': sales,
        'expense_data': expense_data,
        'sale_data': sale_data,
        'total_spent': formatted_total_spent,
        'total_earned': formatted_total_earned,
        'profit': formatted_profit,
    })

@login_required
def add_expense(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.user = request.user
            expense.save()
            return redirect('logbook:logbook')
    else:
        form = ExpenseForm()
    return render(request, 'logbook/add_expense.html', {'form': form})

@login_required
def update_expense(request, pk):
    expense = Expense.objects.get(pk=pk, user=request.user)
    if request.method == 'POST':
        form = ExpenseForm(request.POST, instance=expense)
        if form.is_valid():
            form.save()
            return redirect('logbook:logbook')
    else:
        form = ExpenseForm(instance=expense)
    return render(request, 'logbook/add_expense.html', {'form': form})

@login_required
def delete_expense(request, pk):
    expense = Expense.objects.get(pk=pk, user=request.user)
    if request.method == 'POST':
        expense.delete()
        return redirect('logbook:logbook')
    return render(request, 'logbook/delete_expense.html', {'expense': expense})

@login_required
def add_sale(request):
    if request.method == 'POST':
        form = SaleForm(request.POST)
        if form.is_valid():
            sale = form.save(commit=False)
            sale.user = request.user
            sale.save()
            return redirect('logbook:logbook')
    else:
        form = SaleForm()
    return render(request, 'logbook/add_sale.html', {'form': form})

@login_required
def update_sale(request, pk):
    sale = Sale.objects.get(pk=pk, user=request.user)
    if request.method == 'POST':
        form = SaleForm(request.POST, instance=sale)
        if form.is_valid():
            form.save()
            return redirect('logbook:logbook')
    else:
        form = SaleForm(instance=sale)
    return render(request, 'logbook/add_sale.html', {'form': form})

@login_required
def delete_sale(request, pk):
    sale = Sale.objects.get(pk=pk, user=request.user)
    if request.method == 'POST':
        sale.delete()
        return redirect('logbook:logbook')
    return render(request, 'logbook/delete_sale.html', {'sale': sale})
