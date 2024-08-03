from django.urls import path
from . import views

app_name = 'chemicaltracker'
urlpatterns = [
    path('', views.index, name='chemicalT'),
    path('chemical/<int:pk>/', views.chemical_detail, name='chemical_detail'),
    path('add/', views.add_chemical, name='add_chemical'),
    path('update/<int:pk>/', views.update_chemical, name='update_chemical'),
   
    path('add_recommendation/', views.add_recommendation, name='add_recommendation'),
    path('suggestions/', views.suggest_chemical_applications, name='suggest_chemical_applications'),
    path('add_treatment/', views.add_treatment, name='add_treatment'),
    path('view_treatments/', views.view_treatments, name='view_treatments'),
    path('plant/<str:plant_name>/', views.plant_details, name='plant_details'),
]