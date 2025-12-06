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
  passenger: {
    id: number;
    phone_number: string;
  };
  assigned_driver?: {
    id: number;
    phone_number: string;
  };
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  driver_location?: {
    lat: number;
    lng: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export default function RideTrackingScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { user } = useAuth();
  const { location: driverLocation } = useDriverLocation(rideId ? Number(rideId) : undefined);

  const [ride, setRide] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [offers, setOffers] = useState<any[]>([]);
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

      // Animate map to show pickup and dropoff
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: response.pickup_lat, longitude: response.pickup_lng },
            { latitude: response.dropoff_lat, longitude: response.dropoff_lng },
          ],
          {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          }
        );
      }
    } catch (error) {
      console.error("Failed to fetch ride:", error);
      Alert.alert("Error", "Failed to load ride details");
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

      // Subscribe to location updates
      const unsubscribeLocation = ws.subscribe("location_update", (data: LocationUpdate) => {
        setDriverCoords({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      });

      // Subscribe to ride updates
      const unsubscribeRide = ws.subscribe("ride_update", (data: RideUpdate) => {
        if (data.ride_id === Number(rideId)) {
          setRide((prev) => {
            if (prev) {
              return { ...prev, status: data.status };
            }
            return prev;
          });
        }
      });

      // Subscribe to offers
      const unsubscribeOffers = ws.subscribe("offer", (data: any) => {
        setOffers((prev) => [...prev, data]);
      });

      wsUnsubscribe.current = () => {
        unsubscribeLocation();
        unsubscribeRide();
        unsubscribeOffers();
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    try {
      setLoading(true);
      await api.post(`/rides/offers/${offerId}/accept/`, {});
      Alert.alert("Success", "Offer accepted!");
      fetchRideDetails();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to accept offer");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      await api.post(`/rides/offers/${offerId}/reject/`, {});
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject offer");
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
      Alert.alert("Error", error.message || "Failed to confirm ride");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!rideId) return;
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel this ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post(`/rides/${rideId}/cancel/`, {});
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to cancel ride");
            }
          },
        },
      ]
    );
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

  const isPassenger = user?.user_id === ride.passenger.id;
  const isDriver = user?.user_id === ride.assigned_driver?.id;

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
        {/* Pickup marker */}
        <Marker
          coordinate={{
            latitude: ride.pickup_lat,
            longitude: ride.pickup_lng,
          }}
          title="Pickup"
          pinColor="green"
        />

        {/* Dropoff marker */}
        <Marker
          coordinate={{
            latitude: ride.dropoff_lat,
            longitude: ride.dropoff_lng,
          }}
          title="Dropoff"
          pinColor="red"
        />

        {/* Driver location marker */}
        {driverCoords && (
          <Marker
            coordinate={driverCoords}
            title="Driver Location"
            pinColor="blue"
            description={`Accuracy: ${driverLocation?.accuracy?.toFixed(1)}m`}
          />
        )}

        {/* Route line */}
        {driverCoords && (
          <Polyline
            coordinates={[
              {
                latitude: driverCoords.latitude,
                longitude: driverCoords.longitude,
              },
              {
                latitude: ride.pickup_lat,
                longitude: ride.pickup_lng,
              },
            ]}
            strokeColor="blue"
            strokeWidth={2}
          />
        )}
      </MapView>

      <ScrollView style={styles.info}>
        {/* Driver Info */}
        {ride.assigned_driver && (
          <View style={styles.driverCard}>
            <Text style={styles.cardTitle}>Driver Information</Text>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Driver</Text>
              <Text style={styles.value}>{ride.assigned_driver.phone_number}</Text>
            </View>
            {driverCoords && (
              <>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.value}>
                    {driverCoords.latitude.toFixed(4)}, {driverCoords.longitude.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Accuracy</Text>
                  <Text style={styles.value}>
                    {driverLocation?.accuracy?.toFixed(1) || "N/A"} m
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Location Info */}
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Route Information</Text>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value}>
              {ride.pickup_lat.toFixed(4)}, {ride.pickup_lng.toFixed(4)}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Dropoff</Text>
            <Text style={styles.value}>
              {ride.dropoff_lat.toFixed(4)}, {ride.dropoff_lng.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Offers (for passengers) */}
        {isPassenger && offers.length > 0 && (
          <View style={styles.offersCard}>
            <Text style={styles.cardTitle}>Driver Offers</Text>
            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerItem}>
                <Text style={styles.offerDriver}>{offer.driver.phone_number}</Text>
                <View style={styles.offerButtons}>
                  <Pressable
                    style={styles.acceptButton}
                    onPress={() => handleAcceptOffer(offer.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={styles.rejectButton}
                    onPress={() => handleRejectOffer(offer.id)}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isPassenger && ride.status === "driver_accepted" && (
            <Pressable
              style={styles.confirmButton}
              onPress={handleConfirmRide}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>Confirm Driver</Text>
            </Pressable>
          )}

          {ride.status === "pending" && (
            <Pressable
              style={styles.cancelButton}
              onPress={handleCancelRide}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    fontSize: 16,
    color: "orange",
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    color: "orange",
    backgroundColor: "#fff3cd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  map: {
    width: "100%",
    height: 300,
  },
  info: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  driverCard: {
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "blue",
  },
  locationCard: {
    backgroundColor: "#f0f9f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "green",
  },
  offersCard: {
    backgroundColor: "#fff8f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "orange",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  label: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 12,
    color: "#000",
    fontWeight: "600",
  },
  offerItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  offerDriver: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  offerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "green",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 12,
  },
  actions: {
    gap: 8,
    marginVertical: 12,
  },
  confirmButton: {
    backgroundColor: "green",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});

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
