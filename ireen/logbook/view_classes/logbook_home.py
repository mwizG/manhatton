from django.shortcuts import render  # Import render function to render HTML templates
from django.contrib.auth.decorators import login_required  # Import login_required decorator to restrict access to authenticated users
from django.core.serializers.json import DjangoJSONEncoder  # Import DjangoJSONEncoder for serializing data to JSON
from django.db.models import Sum  # Import Sum to calculate the total of a field
from logbook.models import Expense, Sale  # Import Expense and Sale models from the logbook app
import json  # Import json module for handling JSON data
from datetime import datetime, timedelta  # Import datetime and timedelta for date manipulation
from django.shortcuts import redirect  # Import redirect to redirect users to a different view

@login_required
def clear_filters(request):
    # Redirect to the logbook page without filters
    return redirect('logbook:logbook')  # Redirect to the logbook home view

@login_required
def logbook_home(request):
    # Retrieve all expenses and sales for the current user
    expenses = Expense.objects.filter(user=request.user)
    sales = Sale.objects.filter(user=request.user)

    # Get filter parameters from the request
    filter_by = request.GET.get('filter_by', '')  # Get the filter type (e.g., year, amount_spent)
    filter_value = request.GET.get('filter_value', '')  # Get the value for text filters (e.g., product name)
    filter_value_min = request.GET.get('filter_value_min', '')  # Get the minimum value for amount filters
    filter_value_max = request.GET.get('filter_value_max', '')  # Get the maximum value for amount filters
    filter_range_start = request.GET.get('filter_range_start', '')  # Get the start date for date range filters
    filter_range_end = request.GET.get('filter_range_end', '')  # Get the end date for date range filters

    # Apply filters based on the selected filter type
    if filter_by:
        if filter_by == 'year' and filter_value:
            # Filter by year
            year = int(filter_value)  # Convert filter value to integer
            start_date = datetime(year, 1, 1).date()  # Set start date for the year
            end_date = datetime(year, 12, 31).date()  # Set end date for the year
            expenses = expenses.filter(date__range=[start_date, end_date])  # Filter expenses by date range
            sales = sales.filter(date__range=[start_date, end_date])  # Filter sales by date range
        elif filter_by == 'amount_spent' and filter_value_min and filter_value_max:
            # Filter by amount spent
            expenses = expenses.filter(amount_spent__gte=float(filter_value_min), amount_spent__lte=float(filter_value_max))  # Filter expenses by amount range
        elif filter_by == 'amount_earned' and filter_value_min and filter_value_max:
            # Filter by amount earned
            sales = sales.filter(amount_earned__gte=float(filter_value_min), amount_earned__lte=float(filter_value_max))  # Filter sales by amount range
        elif filter_by in ['product', 'item'] and filter_value and filter_range_start and filter_range_end:
            # Filter by product or item within a date range
            start_date = datetime.strptime(filter_range_start, '%Y-%m-%d').date()  # Convert start date to date object
            end_date = datetime.strptime(filter_range_end, '%Y-%m-%d').date()  # Convert end date to date object
            if filter_by == 'product':
                sales = sales.filter(product__icontains=filter_value, date__range=[start_date, end_date])  # Filter sales by product and date range
            elif filter_by == 'item':
                expenses = expenses.filter(item__icontains=filter_value, date__range=[start_date, end_date])  # Filter expenses by item and date range
        elif filter_by == 'date_range' and filter_range_start and filter_range_end:
            # Filter by date range
            start_date = datetime.strptime(filter_range_start, '%Y-%m-%d').date()  # Convert start date to date object
            end_date = datetime.strptime(filter_range_end, '%Y-%m-%d').date()  # Convert end date to date object
            expenses = expenses.filter(date__range=[start_date, end_date])  # Filter expenses by date range
            sales = sales.filter(date__range=[start_date, end_date])  # Filter sales by date range

    # Calculate totals for expenses and sales
    total_spent = expenses.aggregate(total=Sum('amount_spent'))['total'] or 0  # Calculate total amount spent
    total_earned = sales.aggregate(total=Sum('amount_earned'))['total'] or 0  # Calculate total amount earned
    profit = total_earned - total_spent  # Calculate profit

    # Format values with currency symbol
    formatted_total_spent = f'K{total_spent:,.2f}'  # Format total spent
    formatted_total_earned = f'K{total_earned:,.2f}'  # Format total earned
    formatted_profit = f'K{profit:,.2f}'  # Format profit

    # Prepare data for the chart
    expense_data = expenses.values('date').annotate(total_spent=Sum('amount_spent')).order_by('date')  # Aggregate and order expenses by date
    sale_data = sales.values('date').annotate(total_earned=Sum('amount_earned')).order_by('date')  # Aggregate and order sales by date

    # Serialize data for Chart.js
    expense_data_json = json.dumps(list(expense_data), cls=DjangoJSONEncoder)  # Convert expense data to JSON
    sale_data_json = json.dumps(list(sale_data), cls=DjangoJSONEncoder)  # Convert sale data to JSON

    # Render the template with context data
    return render(request, 'logbook/index.html', {
        'expenses': expenses,  # Pass expenses to the template
        'sales': sales,  # Pass sales to the template
        'expense_data': expense_data_json,  # Pass serialized expense data to the template
        'sale_data': sale_data_json,  # Pass serialized sale data to the template
        'total_spent': formatted_total_spent,  # Pass formatted total spent to the template
        'total_earned': formatted_total_earned,  # Pass formatted total earned to the template
        'profit': formatted_profit,  # Pass formatted profit to the template
        'filter_by': filter_by,  # Pass the current filter type to the template
        'filter_value': filter_value,  # Pass the current filter value to the template
        'filter_value_min': filter_value_min,  # Pass the minimum filter value to the template
        'filter_value_max': filter_value_max,  # Pass the maximum filter value to the template
        'filter_range_start': filter_range_start,  # Pass the start date of the range filter to the template
        'filter_range_end': filter_range_end,  # Pass the end date of the range filter to the template
    })
