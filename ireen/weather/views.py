import requests
from django.shortcuts import render
from django.conf import settings

def weather_forecast(request):
    api_key ='8450fcf8a754b3eacb761aca246cad72'
    city = "Lusaka"  # You can make this dynamic based on user input
    state = ""
    country = "ZM"
    limit = 1
    
    geo_url = 'http://api.openweathermap.org/geo/1.0/direct?q={},{}&limit={}&appid={}'.format(city, country, limit, api_key)
    geo_response = requests.get(geo_url)
    geo_data = geo_response.json()
    print('goe data: ',geo_data)
    if geo_data:
        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        
        weather_url = 'https://api.openweathermap.org/data/2.5/weather?lat={}&lon={}&units=metric&appid={}'.format(lat, lon, api_key)
        weather_response = requests.get(weather_url)
        weather_data = weather_response.json()
        print('weather: ',weather_data)
        context = {
            'data': weather_data
        }
        
        return render(request, 'weather/index.html', context)
    else:
        context = {
            'error': 'Location not found.'
        }
        return render(request, 'weather/index.html', context)

