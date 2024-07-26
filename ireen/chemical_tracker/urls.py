from django.urls import path
from . import views

app_name = 'chemicaltracker'
urlpatterns = [
    path('', views.index, name='chemicalT'),
]
