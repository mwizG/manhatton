from django.db import models

class SoilCondition(models.Model):
    pH = models.DecimalField(max_digits=4, decimal_places=2)
    moisture = models.DecimalField(max_digits=4, decimal_places=2)

    def __str__(self):
        return f"pH: {self.pH}, Moisture: {self.moisture}"

class CropSuggestion(models.Model):
    crop = models.CharField(max_length=100)
    season = models.CharField(max_length=100)
    soil_condition = models.ForeignKey(SoilCondition, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.crop} - {self.season}"
