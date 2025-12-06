import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../services/api";
import { getWebSocketService, LocationUpdate, RideUpdate } from "../../../services/websocket";
import { useDriverLocation } from "../../../hooks/useDriverLocation";

interface RideData {
  id: number;
  status: string;
  passenger: { id: number; phone_number: string };
  assigned_driver?: { id: number; phone_number: string };
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
}

export default function RideTrackingScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { user } = useAuth();
  const { location: driverLocation } = useDriverLocation(rideId ? Number(rideId) : undefined);

  const [ride, setRide] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const wsUnsubscribe = useRef<Function | null>(null);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
      connectWebSocket();
    }
    return () => {
      if (wsUnsubscribe.current) {
        wsUnsubscribe.current();
      }
    };
  }, [rideId]);

  const fetchRideDetails = async () => {
    if (!rideId) return;
    try {
      setLoading(true);
      const response = await api.get(`/rides/${rideId}/`);
      setRide(response);
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: response.pickup_lat, longitude: response.pickup_lng },
            { latitude: response.dropoff_lat, longitude: response.dropoff_lng },
          ],
          { edgePadding: { top: 100, right: 50, bottom: 100, left: 50 }, animated: true }
        );
      }
    } catch (error) {
      console.error("Failed to fetch ride:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    if (!rideId) return;
    try {
      const ws = getWebSocketService();
      if (!ws.isConnected()) {
        await ws.connect(rideId);
      }

      const unsubscribeLocation = ws.subscribe("location_update", (data: LocationUpdate) => {
        setDriverCoords({ latitude: data.latitude, longitude: data.longitude });
      });

      const unsubscribeRide = ws.subscribe("ride_update", (data: RideUpdate) => {
        if (data.ride_id === Number(rideId)) {
          setRide((prev) => (prev ? { ...prev, status: data.status } : prev));
        }
      });

      wsUnsubscribe.current = () => {
        unsubscribeLocation();
        unsubscribeRide();
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  };

  const handleConfirmRide = async () => {
    if (!rideId) return;
    try {
      setLoading(true);
      await api.post(`/rides/${rideId}/confirm/`, {});
      Alert.alert("Success", "Ride confirmed!");
      fetchRideDetails();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !ride) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="orange" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Ride not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Ride Tracking</Text>
        <Text style={styles.status}>{ride.status.toUpperCase()}</Text>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: ride.pickup_lat,
          longitude: ride.pickup_lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude: ride.pickup_lat, longitude: ride.pickup_lng }} title="Pickup" pinColor="green" />
        <Marker coordinate={{ latitude: ride.dropoff_lat, longitude: ride.dropoff_lng }} title="Dropoff" pinColor="red" />
        {driverCoords && (
          <>
            <Marker coordinate={driverCoords} title="Driver" pinColor="blue" />
            <Polyline
              coordinates={[driverCoords, { latitude: ride.pickup_lat, longitude: ride.pickup_lng }]}
              strokeColor="blue"
              strokeWidth={2}
            />
          </>
        )}
      </MapView>

      <ScrollView style={styles.info}>
        {ride.assigned_driver && (
          <View style={styles.driverCard}>
            <Text style={styles.cardTitle}>Driver Information</Text>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Driver</Text>
              <Text style={styles.value}>{ride.assigned_driver.phone_number}</Text>
            </View>
            {driverCoords && (
              <View style={styles.cardRow}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{driverCoords.latitude.toFixed(4)}, {driverCoords.longitude.toFixed(4)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Route</Text>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value}>{ride.pickup_lat.toFixed(4)}, {ride.pickup_lng.toFixed(4)}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Dropoff</Text>
            <Text style={styles.value}>{ride.dropoff_lat.toFixed(4)}, {ride.dropoff_lng.toFixed(4)}</Text>
          </View>
        </View>

        {user?.user_id === ride.passenger.id && ride.status === "driver_accepted" && (
          <Pressable style={styles.confirmButton} onPress={handleConfirmRide} disabled={loading}>
            <Text style={styles.confirmButtonText}>Confirm Driver</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#f5f5f5", borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  backButton: { fontSize: 16, color: "orange", fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: "#000", flex: 1, textAlign: "center" },
  status: { fontSize: 12, fontWeight: "600", color: "orange", backgroundColor: "#fff3cd", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  map: { width: "100%", height: 300 },
  info: { flex: 1, paddingHorizontal: 16, paddingVertical: 12 },
  driverCard: { backgroundColor: "#f0f7ff", borderRadius: 12, padding: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "blue" },
  locationCard: { backgroundColor: "#f0f9f0", borderRadius: 12, padding: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "green" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#000", marginBottom: 8 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" },
  label: { fontSize: 12, color: "#666", fontWeight: "500" },
  value: { fontSize: 12, color: "#000", fontWeight: "600" },
  confirmButton: { backgroundColor: "green", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 12 },
  confirmButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 50 },
});
