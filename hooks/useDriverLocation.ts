// hooks/useDriverLocation.ts
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function useDriverLocation(activeRideId?: number | string) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const uploadInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          return;
        }

        // Get initial location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy || undefined,
          });
          setIsTracking(true);
        }

        // Watch position for continuous updates
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Or every 10 meters
          },
          (newLocation) => {
            if (isMounted) {
              const newCoords = {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                accuracy: newLocation.coords.accuracy || undefined,
              };
              setLocation(newCoords);

              // Upload to backend every time location updates
              if (activeRideId) {
                api
                  .post("/locations/driver-location/", {
                    lat: newCoords.latitude,
                    lng: newCoords.longitude,
                    accuracy: newCoords.accuracy,
                  })
                  .catch((err) => console.error("Failed to update location:", err));
              }
            }
          }
        );
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to get location");
          setIsTracking(false);
        }
      }
    };

    if (activeRideId) {
      startTracking();
    }

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (uploadInterval.current) {
        clearInterval(uploadInterval.current);
      }
    };
  }, [activeRideId]);

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    setLocation(null);
  };

  return {
    location,
    error,
    isTracking,
    stopTracking,
  };
}
