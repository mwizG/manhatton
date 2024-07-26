import requests
from django.shortcuts import render
from django.conf import settings

def weather_forecast(request):
    api_key = settings.OPENWEATHERMAP_API_KEY
    location = "your_location"  # You can make this dynamic based on user input

    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}"
    response = requests.get(url)
    data = response.json()

    context = {
        'data': data
    }

    return render(request, 'weather/index.html', context)
