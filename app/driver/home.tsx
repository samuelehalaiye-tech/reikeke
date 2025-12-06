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
import Navbar from "../../components/Navbar";

interface DriverStats {
  total_rides: number;
  total_earnings: number;
  avg_rating: number;
  acceptance_rate: number;
  active_rides: number;
}

export default function DriverHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get("/rides/driver/stats/");
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
      Alert.alert("Error", "Failed to load driver stats");
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
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.phone}>{user?.phone_number || "Driver"}</Text>
        </View>

        {/* Active Rides Card */}
        <Pressable
          style={styles.activeCard}
          onPress={() => router.push("/driver/active-ride")}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Active Rides</Text>
            <Text style={styles.cardValue}>{stats?.active_rides || 0}</Text>
          </View>
          {stats && stats.active_rides > 0 && (
            <Text style={styles.cardHint}>→ View Details</Text>
          )}
        </Pressable>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Earnings */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={styles.statValue}>${stats?.total_earnings?.toFixed(2) || "0.00"}</Text>
          </View>

          {/* Rating */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingValue}>{stats?.avg_rating || "N/A"}</Text>
              <Text style={styles.ratingStars}>★★★★★</Text>
            </View>
          </View>
        </View>

        {/* More Stats */}
        <View style={styles.statsGrid}>
          {/* Total Rides */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Rides</Text>
            <Text style={styles.statValue}>{stats?.total_rides || 0}</Text>
          </View>

          {/* Acceptance Rate */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Acceptance Rate</Text>
            <Text style={styles.statValue}>{stats?.acceptance_rate || 0}%</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push("/driver/Offers")}
          >
            <Text style={styles.buttonText}>View Offers</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push("/driver/history")}
          >
            <Text style={styles.buttonTextSecondary}>Ride History</Text>
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Quick Tips</Text>
          <Text style={styles.infoText}>
            • Keep your profile updated with current vehicle details
          </Text>
          <Text style={styles.infoText}>
            • Maintain high acceptance rate for more ride offers
          </Text>
          <Text style={styles.infoText}>
            • Complete rides on time to maintain excellent rating
          </Text>
        </View>
      </ScrollView>
      <Navbar />
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
    paddingBottom: 60,
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
  activeCard: {
    margin: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  cardHint: {
    fontSize: 14,
    color: "#FFA500",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
  },
  ratingContainer: {
    marginTop: 8,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFA500",
  },
  ratingStars: {
    fontSize: 14,
    color: "#FFD700",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#FFA500",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
});
