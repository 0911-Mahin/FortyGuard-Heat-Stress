from django.urls import include, path

from .views import *

urlpatterns = [
    path("risk/analyse", analyse, name="analyse"),
    path("status/<uuid:job_id>", job_status, name="status"),
    path("risk/simulate", simulate, name="simulate"),
]
