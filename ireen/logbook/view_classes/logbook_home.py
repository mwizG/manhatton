from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Sum
from logbook.models import Expense, Sale
import json
from datetime import datetime, timedelta
from django.shortcuts import redirect

@login_required
def clear_filters(request):
    # Redirect to the logbook page without filters
    return redirect('logbook:logbook')  # Replace 'logbook:index' with your logbook list view


@login_required
def logbook_home(request):
    expenses = Expense.objects.filter(user=request.user)
    sales = Sale.objects.filter(user=request.user)

    # Get filter parameters
    filter_by = request.GET.get('filter_by', '')
    filter_value = request.GET.get('filter_value', '')
    filter_range_start = request.GET.get('filter_range_start', '')
    filter_range_end = request.GET.get('filter_range_end', '')

    # Apply filters based on the selected option
    if filter_by:
        if filter_by == 'day' and filter_value:
            start_date = datetime.strptime(filter_value, '%Y-%m-%d').date()
            end_date = start_date + timedelta(days=1)  # Single day filter
            expenses = expenses.filter(date__range=[start_date, end_date])
            sales = sales.filter(date__range=[start_date, end_date])
        elif filter_by == 'month' and filter_value:
            year, month = map(int, filter_value.split('-'))
            start_date = datetime(year, month, 1).date()
            end_date = (datetime(year, month + 1, 1) - timedelta(days=1)).date()
            expenses = expenses.filter(date__range=[start_date, end_date])
            sales = sales.filter(date__range=[start_date, end_date])
        elif filter_by == 'year' and filter_value:
            year = int(filter_value)
            start_date = datetime(year, 1, 1).date()
            end_date = datetime(year, 12, 31).date()
            expenses = expenses.filter(date__range=[start_date, end_date])
            sales = sales.filter(date__range=[start_date, end_date])
        elif filter_by == 'amount_spent' and filter_range_start and filter_range_end:
            expenses = expenses.filter(amount_spent__gte=float(filter_range_start), amount_spent__lte=float(filter_range_end))
        elif filter_by == 'amount_earned' and filter_range_start and filter_range_end:
            sales = sales.filter(amount_earned__gte=float(filter_range_start), amount_earned__lte=float(filter_range_end))
        elif filter_by == 'product' and filter_value:
            sales = sales.filter(product__icontains=filter_value)
        elif filter_by == 'item' and filter_value:
            expenses = expenses.filter(item__icontains=filter_value)
        elif filter_by == 'date_range' and filter_range_start and filter_range_end:
            start_date = datetime.strptime(filter_range_start, '%Y-%m-%d').date()
            end_date = datetime.strptime(filter_range_end, '%Y-%m-%d').date()
            expenses = expenses.filter(date__range=[start_date, end_date])
            sales = sales.filter(date__range=[start_date, end_date])

    # Calculate totals
    total_spent = expenses.aggregate(total=Sum('amount_spent'))['total'] or 0
    total_earned = sales.aggregate(total=Sum('amount_earned'))['total'] or 0
    profit = total_earned - total_spent

    # Format values with currency symbol
    formatted_total_spent = f'K{total_spent:,.2f}'
    formatted_total_earned = f'K{total_earned:,.2f}'
    formatted_profit = f'K{profit:,.2f}'

    # Prepare data for the chart
    expense_data = expenses.values('date').annotate(total_spent=Sum('amount_spent')).order_by('date')
    sale_data = sales.values('date').annotate(total_earned=Sum('amount_earned')).order_by('date')

    # Serialize data for Chart.js
    expense_data_json = json.dumps(list(expense_data), cls=DjangoJSONEncoder)
    sale_data_json = json.dumps(list(sale_data), cls=DjangoJSONEncoder)

    return render(request, 'logbook/index.html', {
        'expenses': expenses,
        'sales': sales,
        'expense_data': expense_data_json,
        'sale_data': sale_data_json,
        'total_spent': formatted_total_spent,
        'total_earned': formatted_total_earned,
        'profit': formatted_profit,
        'filter_by': filter_by,
        'filter_value': filter_value,
        'filter_range_start': filter_range_start,
        'filter_range_end': filter_range_end,
    })

