from django.urls import path
from .views import planting_suggestions

urlpatterns = [
    path('', planting_suggestions, name='planting_suggestions'),
]
