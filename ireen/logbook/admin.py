from django.contrib import admin

from .models import Expense,Sale,Tip

admin.site.register(Tip)
admin.site.register(Expense)
admin.site.register(Sale)