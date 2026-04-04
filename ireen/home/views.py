
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie

def home(request):
    return render(request, 'home/home.html')


@login_required
@ensure_csrf_cookie
def react_dashboard(request):
    return render(request, 'home/react_dashboard.html')
