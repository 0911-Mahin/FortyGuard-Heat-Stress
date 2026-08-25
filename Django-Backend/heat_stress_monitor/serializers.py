from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    # Latitude: Using plain integers for min/max boundary checks
    latitude = serializers.DecimalField(
        max_digits=17, decimal_places=15, min_value=-90, max_value=90
    )

    # Longitude: Using plain integers for min/max boundary checks
    longitude = serializers.DecimalField(
        max_digits=18, decimal_places=15, min_value=-180, max_value=180
    )


class SimulationSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
    pct_greenery = serializers.IntegerField(max_value=100, min_value=0)
