import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { api } from "../../services/api";
import Navbar from "../../components/Navbar";

type Offer = {
  id: number;
  ride: number;
  driver_phone?: string;
  status: string;
  expires_at: string;
};

export default function DriverOffers() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOffers();
    const interval = setInterval(loadOffers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rides/offers/");
      setOffers(res || []);
    } catch (err) {
      console.warn("Error loading offers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const accept = async (id: number) => {
    try {
      await api.post(`/rides/offers/${id}/accept/`, {});
      Alert.alert("Success", "Offer accepted! You've been assigned a ride.");
      await loadOffers();
      router.push("/driver/active-ride");
    } catch (err) {
      Alert.alert("Error", "Failed to accept offer");
    }
  };

  const reject = async (id: number) => {
    try {
      await api.post(`/rides/offers/${id}/reject/`, {});
      Alert.alert("Rejected", "Offer rejected");
      await loadOffers();
    } catch (err) {
      Alert.alert("Error", "Failed to reject offer");
    }
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins > 0) {
      return `${diffMins}m left`;
    }
    return "Expired";
  };

  const renderOfferItem = ({ item }: { item: Offer }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.rideId}>Ride Request #{item.ride}</Text>
          <Text style={styles.expiryTime}>{formatExpiry(item.expires_at)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>NEW</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.offerText}>🚗 New ride opportunity available</Text>
        <Text style={styles.offerSubtext}>Estimated Earnings: $50</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.btn, styles.rejectBtn]}
          onPress={() => reject(item.id)}
        >
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.acceptBtn]}
          onPress={() => accept(item.id)}
        >
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyText}>No Offers Available</Text>
      <Text style={styles.emptySubtext}>
        Go online to start receiving ride offers
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ride Offers</Text>
        <Text style={styles.headerSubtitle}>
          {offers.length} offer{offers.length !== 1 ? "s" : ""} available
        </Text>
      </View>

      {loading && offers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOfferItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadOffers} />
          }
          ListFooterComponent={<View style={{ height: 60 }} />}
        />
      )}

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 12,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rideId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  expiryTime: {
    fontSize: 12,
    color: "#ff6b6b",
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  offerSubtext: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtn: {
    backgroundColor: "#4CAF50",
  },
  acceptBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  rejectBtn: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  rejectBtnText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});
