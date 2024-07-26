from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('logbook/', include('logbook.urls')),
    path('chemicaltracker/', include('chemical_tracker.urls')),
    path('weather/', include('weather.urls')),
    path('planting/', include('planting.urls')),
    path('selling/', include('selling.urls')),
    path('users/', include('users.urls')),
    path('', RedirectView.as_view(url='/home/', permanent=False)),  # Redirect base URL to the home URL
    path('', include('home.urls')),  # Include home app's URLs
    path('', include('django.contrib.auth.urls')),  # For login/logout
]
