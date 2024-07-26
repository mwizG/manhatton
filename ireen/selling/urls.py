from django.urls import path
from .views import selling_recommendations
app_name='selling_recom'
urlpatterns = [
    path('', selling_recommendations, name='selling_recom'),
]
