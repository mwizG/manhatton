from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('logbook/', include('logbook.urls')),
    path('chemicaltracker/', include('chemical_tracker.urls')),
    path('weather/', include('weather.urls')),
    path('planting/', include('planting.urls')),
    path('selling/', include('selling.urls')),
    path('users/', include('users.urls')),
    path('', include('django.contrib.auth.urls')),  # For login/logout
]
