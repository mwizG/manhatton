from django.urls import path
from . import views

urlpatterns = [
    path('', views.logbook_home, name='logbook_home'),
    path('add_expense/', views.add_expense, name='add_expense'),
    path('add_sale/', views.add_sale, name='add_sale'),
]
