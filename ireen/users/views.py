from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from .forms import SignUpForm, ProfileForm
from .models import Profile  # Ensure this import is correct

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            # Ensure profile creation
            Profile.objects.get_or_create(user=user)
            
            return redirect('logbook:logbook')  # Redirect to logbook home or any other page
    else:
        form = SignUpForm()
    return render(request, 'users/signup.html', {'form': form})

@login_required
def view_profile(request):
    return render(request, 'users/view_profile.html')

@login_required
def update_profile(request):
    if request.method == 'POST':
        profile_form = ProfileForm(request.POST, instance=request.user.profile)
        if profile_form.is_valid():
            profile_form.save()
            return redirect('users:view_profile')
    else:
        profile_form = ProfileForm(instance=request.user.profile)
    return render(request, 'users/update_profile.html', {'profile_form': profile_form})

def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('logbook:logbook')  # Redirect to logbook home or any other page
    else:
        form = AuthenticationForm()
    return render(request, 'users/login.html', {'form': form})

@login_required
def user_logout(request):
    logout(request)
    return redirect('users:login')
