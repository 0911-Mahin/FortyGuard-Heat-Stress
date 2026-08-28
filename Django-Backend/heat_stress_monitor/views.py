import copy
import threading
import uuid

from django.shortcuts import get_object_or_404, render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import RiskJob, SimulationCache
from .serializers import LocationSerializer, SimulationSerializer
from .services import poll_fortyguard, run_inference


# Create your views here.
@api_view(["POST"])
def analyse(request):
    serializer = LocationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Invalid location coordinates."},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    job_id = str(uuid.uuid4())
    RiskJob.objects.create(job_id=job_id, status="pending")
    thread = threading.Thread(
        target=poll_fortyguard,
        args=(
            job_id,
            serializer.validated_data["latitude"],
            serializer.validated_data["longitude"],
        ),
        daemon=True,
    )
    thread.start()

    return Response({"job_id": job_id}, status=status.HTTP_202_ACCEPTED)


@api_view(["GET"])
def job_status(request, job_id):
    job = get_object_or_404(RiskJob, job_id=job_id)
    return Response(
        {"status": job.status, "result": job.result}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
def simulate(request):
    serializer = SimulationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            "Valid job_id and pct_greenery fields are required",
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    job_id = str(serializer.validated_data["job_id"])
    pct_greenery = serializer.validated_data["pct_greenery"]

    job = RiskJob.objects.filter(job_id=job_id).first()
    if not job:
        return Response("Job not found", status=status.HTTP_404_NOT_FOUND)

    cached_sim = SimulationCache.objects.filter(
        Job=job, pct_greenery=pct_greenery
    ).first()
    if cached_sim:
        return Response({"result": cached_sim.result})

    data = copy.deepcopy(job.result)

    remainder = 100 - pct_greenery
    orig_buildings = data.get("pct_buildings", 0)
    orig_roads = data.get("pct_roads", 0)
    orig_other_total = orig_buildings + orig_roads

    if orig_other_total > 0:
        data["pct_buildings"] = remainder * (orig_buildings / orig_other_total)
        data["pct_roads"] = remainder * (orig_roads / orig_other_total)
    else:
        data["pct_buildings"] = remainder / 2
        data["pct_roads"] = remainder / 2

    data["pct_greenery"] = pct_greenery
    data["predictions"] = run_inference(data)
    SimulationCache.objects.create(Job=job, pct_greenery=pct_greenery, result=data)
    return Response({"result": data}, status=status.HTTP_200_OK)
