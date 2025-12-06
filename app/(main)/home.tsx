import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

interface PassengerStats {
  total_rides: number;
  total_spent: number;
  has_active_ride: boolean;
}

export default function PassengerHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<PassengerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get("/rides/passenger/stats/");
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome!</Text>
          <Text style={styles.phone}>{user?.phone_number || "Passenger"}</Text>
        </View>

        {/* Quick Request Button */}
        <Pressable
          style={styles.quickButton}
          onPress={() => router.push("/(main)/ride-request")}
        >
          <Text style={styles.quickButtonIcon}>🚗</Text>
          <View style={styles.quickButtonContent}>
            <Text style={styles.quickButtonTitle}>Request a Ride</Text>
            <Text style={styles.quickButtonSubtitle}>Get to your destination</Text>
          </View>
          <Text style={styles.quickButtonArrow}>→</Text>
        </Pressable>

        {/* Active Ride Status */}
        {stats?.has_active_ride && (
          <Pressable
            style={styles.activeRideCard}
            onPress={() => router.push("/(main)/rideTracking")}
          >
            <View style={styles.activeRideContent}>
              <Text style={styles.activeRideLabel}>🎯 Active Ride</Text>
              <Text style={styles.activeRideText}>Your ride is on the way</Text>
            </View>
            <Text style={styles.activeRideArrow}>→</Text>
          </Pressable>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Rides */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
            <Text style={styles.statValue}>{stats?.total_rides || 0}</Text>
          </View>

          {/* Total Spent */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>${stats?.total_spent?.toFixed(2) || "0.00"}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionBox}
              onPress={() => router.push("/(main)/saved-locations")}
            >
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={styles.actionLabel}>Saved Locations</Text>
            </Pressable>

            <Pressable
              style={styles.actionBox}
              onPress={() => router.push("/(main)/payment-methods")}
            >
              <Text style={styles.actionIcon}>💳</Text>
              <Text style={styles.actionLabel}>Payment Methods</Text>
            </Pressable>

            <Pressable
              style={styles.actionBox}
              onPress={() => router.push("/(main)/rides-history")}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionLabel}>Ride History</Text>
            </Pressable>

            <Pressable
              style={styles.actionBox}
              onPress={() => router.push("/(main)/profile")}
            >
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionLabel}>Profile</Text>
            </Pressable>
          </View>
        </View>

        {/* Promo Section */}
        <View style={styles.promoSection}>
          <Text style={styles.promoTitle}>Special Offer</Text>
          <Text style={styles.promoText}>Get 20% off on your next 3 rides! 🎉</Text>
          <Pressable style={styles.promoButton}>
            <Text style={styles.promoButtonText}>View Offers</Text>
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Need Help?</Text>
          <Pressable style={styles.infoRow}>
            <Text style={styles.infoIcon}>💬</Text>
            <Text style={styles.infoText}>Contact Support</Text>
          </Pressable>
          <Pressable style={styles.infoRow}>
            <Text style={styles.infoIcon}>❓</Text>
            <Text style={styles.infoText}>FAQ</Text>
          </Pressable>
          <Pressable style={styles.infoRow}>
            <Text style={styles.infoIcon}>⭐</Text>
            <Text style={styles.infoText}>Rate the App</Text>
          </Pressable>
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
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  phone: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
  quickButton: {
    margin: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
  },
  quickButtonIcon: {
    fontSize: 32,
  },
  quickButtonContent: {
    flex: 1,
  },
  quickButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  quickButtonSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  quickButtonArrow: {
    fontSize: 18,
    color: "#FFA500",
    fontWeight: "600",
  },
  activeRideCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  activeRideContent: {
    flex: 1,
  },
  activeRideLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFA500",
  },
  activeRideText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activeRideArrow: {
    fontSize: 16,
    color: "#FFA500",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 6,
  },
  quickActions: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionBox: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  promoSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#FFE0B2",
    padding: 16,
    borderRadius: 12,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFA500",
  },
  promoText: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});
