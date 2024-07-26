from django.urls import path
from .views import planting_suggestions

app_name='planting_sug'
urlpatterns = [
    path('', planting_suggestions, name='planting_sug'),
]
