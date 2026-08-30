import datetime
import logging
import os
import time
from functools import lru_cache

import numpy as np
import requests
from django.conf import settings

from .models import RiskJob, SimulationCache

logger = logging.getLogger(__name__)
BASE_URL = "https://api.fortyguard.com/v1"
HEADERS = {"api-key": settings.FG_API_KEY, "Content-Type": "application/json"}
FEATURES = [
    "hour",
    "day_of_year",
    "wet_bulb",
    "apparent_temp",
    "humidity",
    "cloud_cover_octas",
    "ghi",
    "dni",
    "dhi",
    "pct_buildings",
    "pct_roads",
    "pct_greenery",
    "wbgt_now"
]


@lru_cache(maxsize=6)
def load_model(horizon: int):
    # cached so each model is loaded from disk once per process, not per request
    import joblib

    model = joblib.load(
        os.path.join(settings.BASE_DIR, "models", f"wet_bulb_model_t{horizon}.joblib")
    )
    return model


def build_payload(latitude, longitude):
    latitude, longitude = float(latitude), float(longitude)
    current_date = datetime.datetime.now()  # - datetime.timedelta(hours=12)
    date = current_date.strftime("%Y-%m-%d")
    time = current_date.strftime("%H:00")
    env_payload = {
        "latitude": latitude,
        "longitude": longitude,
        "temperature": 0,
        "date_time": {"start_date": date, "start_time": time, "filter_type": 1},
        "analysis": [
            "apparent_temperature_celsius",
            "wet_bulb_temperature_celsius",
            "relative_humidity_percent",
            "cloud_cover_octas",
            "solar_irradiance",
        ],
    }
    seg_payload = {
        "sat": {"latitude": latitude, "longitude": longitude},
        "date_time": {"start_date": date, "filter_type": 3},
        "granularity": 100,
    }

    return env_payload, seg_payload


def submit_and_poll(submit_url, payload, max_attempts, interval):
    submit = requests.post(submit_url, json=payload, headers=HEADERS)
    activity_id = submit.json()["data"]["activity_id"]

    for _ in range(max_attempts):
        time.sleep(interval)
        res = requests.get(f"{BASE_URL}/status/{activity_id}", headers=HEADERS).json()
        status = res["data"]["status"].lower()
        if status in ("completed", "succeeded"):
            return res
        if status in ("failed", "error"):
            raise RuntimeError(f"Job {activity_id} failed: {res}")
    raise TimeoutError(f"Job {activity_id} timed out")


def bucket_segments(res):
    segments = res["data"]["result"]["segmentation"]["segments"]
    return {
        "pct_buildings": segments.get("building", 0)
        + segments.get("skyscraper", 0)
        + segments.get("column, pillar", 0)
        + segments.get("car", 0),
        "pct_roads": segments.get("road, route", 0)
        + segments.get("sidewalk, pavement", 0),
        "pct_greenery": segments.get("tree", 0)
        + segments.get("grass", 0)
        + segments.get("plant", 0),
    }


def extract_features(env_result, seg_result):
    result = env_result["data"]["result"]
    timestamp = result["metadata"]["timestamps"]
    loc = result["locations"][0]
    params = loc["parameters"]
    solar = loc["solar_irradiance"]["clear_sky"]
    day = datetime.date.fromisoformat(result["metadata"]["time_range"]["start"][:10])
    day_of_year = day.timetuple().tm_yday
    return {
        "hour": int(timestamp[0][11:13]),
        "day_of_year": day_of_year,
        "apparent_temp": params["apparent_temperature_celsius"][0],
        "humidity": params["relative_humidity_percent"][0],
        "cloud_cover_octas": params["cloud_cover_octas"][0],
        "wet_bulb": params["wet_bulb_temperature_celsius"][0],
        "ghi": solar["ghi"],
        "dni": solar["dni"],
        "dhi": solar["dhi"],
        "wbgt_now": 0.7 * params["wet_bulb_temperature_celsius"][0] + 0.3 * params["apparent_temperature_celsius"][0]
    } | bucket_segments(seg_result)


def run_inference(features):
    import numpy as np

    X = np.array([[features[k] for k in FEATURES]])

    predictions = {}
    for horizon in range(1, 7):
        model = load_model(horizon)
        predictions[f"t+{horizon}h"] = float(model.predict(X)[0])
    return predictions


def poll_fortyguard(job_id, latitude, longitude):
    try:
        env_payload, seg_payload = build_payload(latitude, longitude)

        env_result = submit_and_poll(BASE_URL + "/env_params", env_payload, 60, 3)
        seg_result = {"data": {"result": {"segmentation": {"segments": {}}}}}
        try:
            seg_result = submit_and_poll(BASE_URL + "/satellite", seg_payload, 15, 3)
        except Exception as e:
            logger.warning(
                f"Segmentation API failed, falling back to empty segments: {e}"
            )

        features = extract_features(env_result, seg_result)
        features["predictions"] = run_inference(features)

        Job = RiskJob.objects.get(job_id=job_id)
        Job.status = "completed"
        Job.result = features
        Job.save()
        SimulationCache.objects.create(
            Job=Job, pct_greenery=features["pct_greenery"], result=features
        )
    except Exception as e:
        RiskJob.objects.filter(job_id=job_id).update(
            status="failed", result={"error": str(e)}
        )
