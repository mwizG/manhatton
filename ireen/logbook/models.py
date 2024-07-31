from django.db import models
from django.contrib.auth.models import User

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.CharField(max_length=100)
    amount_spent = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(null=True, blank=True)
    category= models.CharField(max_length=100,null=True, blank=True) # New quantity field
    date = models.DateField()

    def __str__(self):
        return f"{self.item} - {self.amount_spent}"

class Sale(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.CharField(max_length=100)
    amount_earned = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(null=True, blank=True)
    category= models.CharField(max_length=100,null=True, blank=True)  # New quantity field
    date = models.DateField()

    def __str__(self):
        return f"{self.product} - {self.amount_earned}"

class Tip(models.Model):
    content = models.TextField()

    def __str__(self):
        return self.content[:50]
