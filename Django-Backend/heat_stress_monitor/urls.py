from django.urls import include, path

from .views import *

urlpatterns = [path("risk/analyse", analyse, name="analyse")]
