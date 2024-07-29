from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse
from .models import Expense, Sale
from .forms import ExpenseForm, SaleForm
import json

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
