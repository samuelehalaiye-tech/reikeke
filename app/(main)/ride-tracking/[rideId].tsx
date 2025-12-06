// app/(main)/ride-tracking/[rideId].tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../../services/api";

export default function RideTracking() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const [ride, setRide] = useState<any>(null);

  const poll = async () => {
    if (!rideId) return;
    try {
      const res = await api.get(`/rides/ride/${rideId}/`);
      setRide(res);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [rideId]);

  if (!ride) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: ride.driver_location?.lat ?? ride.pickup_lat,
          longitude: ride.driver_location?.lng ?? ride.pickup_lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {ride.driver_location && (
          <Marker
            coordinate={{ latitude: ride.driver_location.lat, longitude: ride.driver_location.lng }}
            title="Driver"
          />
        )}
        <Marker coordinate={{ latitude: ride.pickup_lat, longitude: ride.pickup_lng }} title="Pickup" />
        <Marker coordinate={{ latitude: ride.dropoff_lat, longitude: ride.dropoff_lng }} title="Dropoff" />
      </MapView>
      <View style={{ padding: 12 }}>
        <Text>Ride status: {ride.status}</Text>
      </View>
    </View>
  );
}
