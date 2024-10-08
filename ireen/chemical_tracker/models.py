from django.db import models
from django.contrib.auth.models import User

class Chemical(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    name = models.CharField(max_length=100)
    active_ingredient = models.CharField(max_length=100)
    usage_instructions = models.TextField()
    associated_products = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Treatment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    chemical = models.ForeignKey(Chemical, on_delete=models.CASCADE)
    plant = models.CharField(max_length=100)
    illness = models.CharField(max_length=100)
    treatment_date = models.DateField()
    is_preventative = models.BooleanField(default=False)
    duration_days = models.PositiveIntegerField(help_text="Duration of the treatment in days")
    times_per_week = models.PositiveIntegerField(help_text="Number of times per week the treatment is applied")
    
    def __str__(self):
        return f"{self.plant} - {self.illness} - {self.chemical.name} - {self.treatment_date}"


class TreatmentProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE)
    date = models.DateField()
    details = models.TextField()

    def __str__(self):
        return f"Progress on {self.date}"


class FinalResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    treatment = models.OneToOneField(Treatment, on_delete=models.CASCADE)
    date = models.DateField(blank=True, null=True)

    observation = models.TextField(blank=True, null=True, help_text="input what you observed with the treatment")
    success = models.BooleanField(default=False)
    minor_result = models.BooleanField(default=False)
    failed = models.BooleanField(default=False)

    def __str__(self):
        return f"Final Result for {self.treatment} on {self.date}"

class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    chemical = models.ForeignKey(Chemical, on_delete=models.CASCADE)
    recommended_date = models.DateField()
    reason = models.TextField()
    result = models.TextField(blank=True, null=True)
    plant = models.CharField(max_length=100)  # Added for specificity
    illness = models.CharField(max_length=100)  # Added for specificity
    success = models.BooleanField(default=False)  # Success checkbox
    minor_result = models.BooleanField(default=False)  # Minor result checkbox

    def __str__(self):
        return f"Recommendation for {self.chemical.name} on {self.recommended_date}"

