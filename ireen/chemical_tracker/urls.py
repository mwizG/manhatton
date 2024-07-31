from django.urls import path
from . import views

app_name = 'chemicaltracker'
urlpatterns = [
    path('', views.index, name='chemicalT'),
    path('chemical/<int:pk>/', views.chemical_detail, name='chemical_detail'),
    path('add/', views.add_chemical, name='add_chemical'),
    path('update/<int:pk>/', views.update_chemical, name='update_chemical'),
    path('add_application/', views.add_chemical_application, name='add_chemical_application'),
    path('add_recommendation/', views.add_recommendation, name='add_recommendation'),
    path('suggestions/', views.suggest_chemical_applications, name='suggest_chemical_applications'),
    path('add_treatment/', views.add_treatment, name='add_treatment'),
]