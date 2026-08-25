from django.db import models


# Create your models here.
class RiskJob(models.Model):
    job_id = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=20, default="pending")
    result = models.JSONField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)


class SimulationCache(models.Model):
    Job = models.ForeignKey(
        RiskJob, on_delete=models.CASCADE, related_name="simulations"
    )
    pct_greenery = models.FloatField()
    result = models.JSONField()
