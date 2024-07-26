from django.contrib import admin

# Register your models here.
from .models import Chemical,Treatment

admin.site.register(Chemical)
admin.site.register(Treatment)