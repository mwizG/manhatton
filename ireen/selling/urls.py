from django.urls import path
from .views import selling_recommendations

urlpatterns = [
    path('', selling_recommendations, name='recom'),
]
