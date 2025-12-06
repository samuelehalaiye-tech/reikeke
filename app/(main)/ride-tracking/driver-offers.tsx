import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../services/api";
import { useRouter } from "expo-router";

interface Offer {
  id: number;
  ride: number;
  driver: { id: number; phone_number: string };
  status: string;
  pickup_location?: string;
  dropoff_location?: string;
  expires_at: string;
}

export default function DriverOffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadOffers = async () => {
    try {
      if (!loading) setLoading(true);
      const res = await api.get("/rides/offers/");
      setOffers(res || []);
    } catch (err) {
      console.warn("Failed to load offers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOffers();
    const interval = setInterval(loadOffers, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOffer = async (offerId: number, rideId: number) => {
    try {
      setLoading(true);
      await api.post(`/rides/offers/${offerId}/accept/`, {});
      Alert.alert("Success", "Offer accepted!");
      
      // Navigate to ride tracking
      router.push({
        pathname: "/(main)/ride-tracking/rideTracking",
        params: { rideId },
      });
      
      loadOffers();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to accept offer");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      setLoading(true);
      await api.post(`/rides/offers/${offerId}/reject/`, {});
      Alert.alert("Rejected", "Offer rejected");
      loadOffers();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject offer");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOffers();
  };

  if (loading && offers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="orange" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Offers</Text>
        <Text style={styles.subtitle}>{offers.length} active offer(s)</Text>
      </View>

      {offers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No offers at the moment</Text>
          <Text style={styles.emptySubtext}>Pull to refresh</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["orange"]} />}
          renderItem={({ item }) => (
            <View style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerTitle}>Ride #{item.ride}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "pending" && styles.statusPending,
                    item.status === "accepted" && styles.statusAccepted,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.offerDetails}>
                <Text style={styles.label}>Created:</Text>
                <Text style={styles.value}>{new Date(item.expires_at).toLocaleTimeString()}</Text>
              </View>

              {item.status === "pending" && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleAcceptOffer(item.id, item.ride)}
                    disabled={loading}
                  >
                    <Text style={styles.acceptButtonText}>Accept Offer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleRejectOffer(item.id)}
                    disabled={loading}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === "accepted" && (
                <View style={styles.acceptedContainer}>
                  <Text style={styles.acceptedText}>Waiting for passenger confirmation...</Text>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    paddingVertical: 16,
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  statusPending: {
    backgroundColor: "#fff3cd",
  },
  statusAccepted: {
    backgroundColor: "#d4edda",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  offerDetails: {
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    color: "#000",
    fontWeight: "600",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "orange",
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  rejectButton: {
    backgroundColor: "#f0f0f0",
  },
  rejectButtonText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 14,
  },
  acceptedContainer: {
    backgroundColor: "#d4edda",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  acceptedText: {
    fontSize: 13,
    color: "#155724",
    fontWeight: "500",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});
