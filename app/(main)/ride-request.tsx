import React, { useState, useRef, useEffect } from "react";
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
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { useDriverLocation } from "../../hooks/useDriverLocation";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function RideRequestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { location: currentLocation } = useDriverLocation();

  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"pickup" | "dropoff" | "confirm">("pickup");
  const [rideId, setRideId] = useState<number | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await getAddressFromCoords(
        location.coords.latitude,
        location.coords.longitude
      );

      setPickupLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address,
      });

      // Animate map to current location
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error("Failed to get location:", error);
      Alert.alert("Error", "Could not get your current location");
    }
  };

  const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        return `${address.street || ""} ${address.city || ""} ${address.region || ""}`.trim();
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error("Geocoding error:", error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const address = await getAddressFromCoords(latitude, longitude);

    if (step === "pickup") {
      setPickupLocation({ latitude, longitude, address });
    } else if (step === "dropoff") {
      setDropoffLocation({ latitude, longitude, address });
    }
  };

  const handleRequestRide = async () => {
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert("Error", "Please select both pickup and dropoff locations");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/rides/create/", {
        pickup_lat: pickupLocation.latitude,
        pickup_lng: pickupLocation.longitude,
        dropoff_lat: dropoffLocation.latitude,
        dropoff_lng: dropoffLocation.longitude,
      });

      setRideId(response.id);
      Alert.alert("Success", "Ride request created! Waiting for drivers...");
      setStep("confirm");

      // Navigate to ride tracking after a delay
      setTimeout(() => {
        router.push({
          pathname: "/(main)/ride-tracking/[rideId]",
          params: { rideId: response.id },
        });
      }, 2000);
    } catch (error: any) {
      console.error("Failed to request ride:", error);
      Alert.alert("Error", error.message || "Failed to create ride request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Request a Ride</Text>
        <Text style={styles.subtitle}>
          {step === "pickup"
            ? "Select pickup location"
            : step === "dropoff"
            ? "Select dropoff location"
            : "Confirm your ride"}
        </Text>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        onPress={handleMapPress}
        initialRegion={{
          latitude: pickupLocation?.latitude || 0,
          longitude: pickupLocation?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {pickupLocation && (
          <Marker
            coordinate={{
              latitude: pickupLocation.latitude,
              longitude: pickupLocation.longitude,
            }}
            title="Pickup"
            pinColor="green"
          />
        )}
        {dropoffLocation && (
          <Marker
            coordinate={{
              latitude: dropoffLocation.latitude,
              longitude: dropoffLocation.longitude,
            }}
            title="Dropoff"
            pinColor="red"
          />
        )}
      </MapView>

      <ScrollView style={styles.info}>
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>Pickup Location</Text>
          <Text style={styles.locationText}>{pickupLocation?.address || "Not selected"}</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => {
              setStep("pickup");
              getCurrentLocation();
            }}
          >
            <Text style={styles.selectButtonText}>
              {pickupLocation ? "Change" : "Select"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>Dropoff Location</Text>
          <Text style={styles.locationText}>{dropoffLocation?.address || "Not selected"}</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setStep("dropoff")}
            disabled={!pickupLocation}
          >
            <Text style={styles.selectButtonText}>
              {dropoffLocation ? "Change" : "Select"}
            </Text>
          </Pressable>
        </View>

        {pickupLocation && dropoffLocation && (
          <Pressable
            style={[styles.requestButton, loading && styles.requestButtonDisabled]}
            onPress={handleRequestRide}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.requestButtonText}>Request Ride</Text>
            )}
          </Pressable>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  map: {
    width: "100%",
    height: 300,
  },
  info: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: "orange",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  requestButton: {
    backgroundColor: "orange",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
