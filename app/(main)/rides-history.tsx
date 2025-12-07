import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";

interface HistoryTrip {
  id: number;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  completed_at: string;
  created_at: string;
  driver_info: {
    phone: string;
    id: number;
  } | null;
}

export default function PassengerTripsHistory() {
  const [trips, setTrips] = useState<HistoryTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.get("/rides/passenger/history/");
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading history:", err);
      Alert.alert("Error", "Failed to load trip history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const renderTripItem = ({ item }: { item: HistoryTrip }) => {
    const distance = calculateDistance(
      item.pickup_lat,
      item.pickup_lng,
      item.dropoff_lat,
      item.dropoff_lng
    );
    const cost = (parseFloat(distance) * 5).toFixed(2);

    return (
      <Pressable
        style={styles.tripCard}
        onPress={() =>
          Alert.alert(
            "Trip Details",
            `Distance: ${distance} km\nCost: $${cost}\nOperator: ${item.driver_info?.phone || "Unknown"}`
          )
        }
      >
        <View style={styles.tripHeader}>
          <View style={styles.headerInfo}>
            <Text style={styles.tripId}>Trip #{item.id}</Text>
            <Text style={styles.tripDate}>{formatDate(item.completed_at)}</Text>
          </View>
          <View style={styles.costTag}>
            <Text style={styles.costText}>${cost}</Text>
          </View>
        </View>

        <View style={styles.tripBody}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.coordinates}>
                {item.pickup_lat.toFixed(3)}, {item.pickup_lng.toFixed(3)}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📌</Text>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.coordinates}>
                {item.dropoff_lat.toFixed(3)}, {item.dropoff_lng.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tripFooter}>
          <Text style={styles.distanceText}>📊 {distance} km</Text>
          <Text style={styles.ratingText}>⭐ Rate this trip</Text>
        </View>
      </Pressable>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSubtitle}>
          {trips.length} completed trip{trips.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No trips yet</Text>
          <Text style={styles.emptySubtext}>
            Your completed trips will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTripItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  listContent: {
    padding: 12,
  },
  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF8F0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF8F0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerInfo: {
    flex: 1,
  },
  rideId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  tripId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  rideDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  tripDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  costTag: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  costText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  rideBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tripBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    marginBottom: 2,
  },
  coordinates: {
    fontSize: 11,
    color: "#666",
    fontFamily: "monospace",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },
  rideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  ratingText: {
    fontSize: 12,
    color: "#FFA500",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});
