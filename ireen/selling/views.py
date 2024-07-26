from django.shortcuts import render

def selling_recommendations(request):
    recommendations = [
        {"location": "Market A", "demand": "High", "price": "Good"},
        {"location": "Market B", "demand": "Medium", "price": "Average"}
    ]
    return render(request, 'selling/recom.html', {'recommendations': recommendations})
