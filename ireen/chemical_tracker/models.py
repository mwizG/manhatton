from django.db import models



class Chemical(models.Model):
    name = models.CharField(max_length=100)
    active_ingredient = models.CharField(max_length=100)
    purchase_date = models.DateField()

    def __str__(self):
        return f"{self.name} - {self.active_ingredient}"

class Treatment(models.Model):
    plant = models.CharField(max_length=100)
    illness = models.CharField(max_length=100)
    chemical = models.ForeignKey(Chemical, on_delete=models.CASCADE)
    treatment_date = models.DateField()

    def __str__(self):
        return f"{self.plant} - {self.illness} - {self.chemical.name}"
