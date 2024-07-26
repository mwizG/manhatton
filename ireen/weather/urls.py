from django.urls import path
from .views import weather_forecast

app_name='weather'
urlpatterns = [
    path('', weather_forecast, name='weather_forecast'),
]
