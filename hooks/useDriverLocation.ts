// hooks/useDriverLocation.ts
import * as Location from "expo-location";
import { useEffect } from "react";
import { api } from "../services/api";

export function useDriverLocation(activeRideId?: number | string) {
  useEffect(() => {
    let interval: NodeJS.Timer | null = null;
    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const send = async () => {
        const pos = await Location.getCurrentPositionAsync({});
        await api.post("/rides/drivers/location/", { lat: pos.coords.latitude, lng: pos.coords.longitude });
      };
      await send();
      interval = setInterval(send, 5000);
    };
    if (activeRideId) start();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRideId]);
}
