import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { useDriverLocation } from "../../hooks/useDriverLocation";

interface Ride {
  id: number;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  driver_phone: string;
  created_at: string;
  started_at: string;
  completed_at: string;
}

export default function DriverActiveRide() {
  const router = useRouter();
  const { user } = useAuth();
  const { location: driverLocation } = useDriverLocation();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(false);

  useEffect(() => {
    loadActiveRide();
    const interval = setInterval(loadActiveRide, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveRide = async () => {
    try {
      const data = await api.get("/rides/driver/active-ride/");
      setRide(data);
    } catch (err) {
      console.log("No active ride");
      setRide(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async () => {
    if (!ride) return;
    setActionsLoading(true);
    try {
      await api.post(`/rides/rides/${ride.id}/start/`, {});
      Alert.alert("Success", "Ride started");
      await loadActiveRide();
    } catch (err) {
      Alert.alert("Error", "Failed to start ride");
    } finally {
      setActionsLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!ride) return;
    setActionsLoading(true);
    try {
      await api.post(`/rides/rides/${ride.id}/complete/`, {});
      Alert.alert("Success", "Ride completed");
      await loadActiveRide();
    } catch (err) {
      Alert.alert("Error", "Failed to complete ride");
    } finally {
      setActionsLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.noRideText}>No active ride</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const mapRegion = {
    latitude: ride.pickup_lat,
    longitude: ride.pickup_lng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Map View */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={mapRegion}
        >
          {/* Driver Location */}
          {driverLocation && (
            <Marker
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
              title="You"
              description="Your current location"
              pinColor="#FFA500"
            />
          )}

          {/* Pickup Location */}
          <Marker
            coordinate={{
              latitude: ride.pickup_lat,
              longitude: ride.pickup_lng,
            }}
            title="Pickup"
            description="Passenger pickup location"
            pinColor="#00cc00"
          />

          {/* Dropoff Location */}
          <Marker
            coordinate={{
              latitude: ride.dropoff_lat,
              longitude: ride.dropoff_lng,
            }}
            title="Dropoff"
            description="Passenger destination"
            pinColor="#cc0000"
          />
        </MapView>

        {/* Ride Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Ride Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{ride.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Locations</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>📍 Pickup</Text>
              <Text style={styles.coordinates}>
                {ride.pickup_lat.toFixed(4)}, {ride.pickup_lng.toFixed(4)}
              </Text>
            </View>
            <View style={[styles.locationRow, { marginTop: 12 }]}>
              <Text style={styles.locationLabel}>📍 Dropoff</Text>
              <Text style={styles.coordinates}>
                {ride.dropoff_lat.toFixed(4)}, {ride.dropoff_lng.toFixed(4)}
              </Text>
            </View>
          </View>

          {driverLocation && (
            <View style={styles.detailCard}>
              <Text style={styles.sectionTitle}>Your Location</Text>
              <Text style={styles.coordinates}>
                {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {ride.status === "passenger_confirmed" && (
              <Pressable
                style={[styles.actionBtn, styles.startBtn]}
                onPress={handleStartRide}
                disabled={actionsLoading}
              >
                {actionsLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Start Ride</Text>
                )}
              </Pressable>
            )}

            {ride.status === "ongoing" && (
              <Pressable
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={handleCompleteRide}
                disabled={actionsLoading}
              >
                {actionsLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Complete Ride</Text>
                )}
              </Pressable>
            )}

            {ride.status === "completed" && (
              <View style={styles.completedContainer}>
                <Text style={styles.completedText}>✓ Ride Completed</Text>
                <Pressable
                  style={styles.homeBtn}
                  onPress={() => router.push("/driver/home")}
                >
                  <Text style={styles.homeBtnText}>Back to Home</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRideText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#FFA500",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  map: {
    height: 300,
    width: "100%",
  },
  detailsSection: {
    padding: 16,
  },
  detailCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFA500",
  },
  locationRow: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    backgroundColor: "#4CAF50",
  },
  completeBtn: {
    backgroundColor: "#2196F3",
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  completedContainer: {
    alignItems: "center",
  },
  completedText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 16,
  },
  homeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#FFA500",
    borderRadius: 8,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
