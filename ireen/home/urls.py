# In home/urls.py
from django.urls import path
from .views import home, react_dashboard
app_name='home'
urlpatterns = [
    path('home/', home, name='home'),  # This makes '/' point to the home view
    path('dashboard/', react_dashboard, name='react_dashboard'),
]
