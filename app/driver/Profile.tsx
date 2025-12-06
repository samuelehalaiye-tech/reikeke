import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function DriverProfile() {
  const { user, logout } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleActive = async (value: boolean) => {
    setIsActive(value);
    try {
      // Call backend to update driver status
      await api.post("/locations/driver-location/update/", {
        is_active: value,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      setIsActive(!value);
      Alert.alert("Error", "Failed to update driver status");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: logout,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.name}>{user?.phone_number || "Driver"}</Text>
        </View>

        {/* Active Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Status</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusLabel}>Online Status</Text>
                <Text style={styles.statusDescription}>
                  {isActive ? "You are online and receiving offers" : "You are offline"}
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#ccc", true: "#81c784" }}
                thumbColor={isActive ? "#FFA500" : "#f4f3f4"}
                onValueChange={toggleActive}
                value={isActive}
              />
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone_number}</Text>
            </View>
            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <Text style={styles.infoValue}>Driver</Text>
            </View>
            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>Today</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
          </View>
          <Pressable style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Add Vehicle Details</Text>
              <Text style={styles.cardDescription}>
                Add your vehicle information to start accepting rides
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </Pressable>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents & Verification</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.documentRow}>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>Driver's License</Text>
                <Text style={styles.docStatus}>Not Verified</Text>
              </View>
              <Text style={styles.docBadge}>⚠️</Text>
            </View>
            <View style={[styles.documentRow, styles.borderTop]}>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>Vehicle Registration</Text>
                <Text style={styles.docStatus}>Not Verified</Text>
              </View>
              <Text style={styles.docBadge}>⚠️</Text>
            </View>
            <View style={[styles.documentRow, styles.borderTop]}>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>Insurance</Text>
                <Text style={styles.docStatus}>Not Verified</Text>
              </View>
              <Text style={styles.docBadge}>⚠️</Text>
            </View>
          </View>
          <Pressable
            style={styles.actionButton}
            onPress={() => Alert.alert("Info", "Document upload coming soon")}
          >
            <Text style={styles.actionButtonText}>Upload Documents</Text>
          </Pressable>
        </View>

        {/* Bank Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Information</Text>
          </View>
          <Pressable style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Add Bank Account</Text>
              <Text style={styles.cardDescription}>
                Add your bank details for payout transfers
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </Pressable>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>
          <Pressable style={styles.card}>
            <Text style={styles.settingItem}>📞 Contact Support</Text>
          </Pressable>
          <Pressable style={styles.card}>
            <Text style={styles.settingItem}>📋 Terms & Conditions</Text>
          </Pressable>
          <Pressable style={styles.card}>
            <Text style={styles.settingItem}>🔒 Privacy Policy</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={{ height: 20 }} />
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
  header: {
    backgroundColor: "#FFA500",
    alignItems: "center",
    paddingVertical: 20,
    paddingTop: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  infoLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  cardArrow: {
    fontSize: 18,
    color: "#FFA500",
    fontWeight: "600",
    marginLeft: 8,
  },
  documentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  docStatus: {
    fontSize: 12,
    color: "#ff6b6b",
    marginTop: 4,
    fontWeight: "500",
  },
  docBadge: {
    fontSize: 16,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "#FFA500",
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  settingItem: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    paddingVertical: 4,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
