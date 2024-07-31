from django.db import models


class Chemical(models.Model):
    name = models.CharField(max_length=100)
    active_ingredient = models.CharField(max_length=100)
    usage_instructions = models.TextField()
    associated_products = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Treatment(models.Model):
    plant = models.CharField(max_length=100)
    illness = models.CharField(max_length=100)
    chemical = models.ForeignKey(Chemical, on_delete=models.CASCADE)
    treatment_date = models.DateField()

    def __str__(self):
        return f"{self.plant} - {self.illness} - {self.chemical.name}"


class ChemicalApplication(models.Model):
    chemical = models.ForeignKey(Chemical, on_delete=models.CASCADE)
    application_date = models.DateField()
    result = models.TextField(blank=True, null=True)
    is_preventative = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.chemical.name} applied on {self.application_date}"

class Recommendation(models.Model):
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


