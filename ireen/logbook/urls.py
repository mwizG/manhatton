from django.urls import path
from . import views
from . view_classes.logbook_home import logbook_home
from . view_classes.logbook_home import clear_filters

app_name = 'logbook'

urlpatterns = [
    path('', logbook_home, name='logbook'),
    path('clear-filters/', clear_filters, name='clear_filters'),
    path('add_expense/', views.add_expense, name='add_expense'),
    path('update_expense/<int:pk>/', views.update_expense, name='update_expense'),
    path('delete_expense/<int:pk>/', views.delete_expense, name='delete_expense'),
    path('add_sale/', views.add_sale, name='add_sale'),
    path('update_sale/<int:pk>/', views.update_sale, name='update_sale'),
    path('delete_sale/<int:pk>/', views.delete_sale, name='delete_sale'),
]
