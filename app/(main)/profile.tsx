import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function PassengerProfile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Passenger User");
  const [email, setEmail] = useState("passenger@example.com");

  const handleSave = () => {
    Alert.alert("Success", "Profile updated");
    setIsEditing(false);
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
          <Text style={styles.name}>{user?.phone_number || "Passenger"}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <Pressable
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            {isEditing ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                  />
                </View>
                <Pressable
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{name}</Text>
                </View>
                <View style={[styles.infoRow, styles.borderTop]}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{email}</Text>
                </View>
                <View style={[styles.infoRow, styles.borderTop]}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user?.phone_number}</Text>
                </View>
                <View style={[styles.infoRow, styles.borderTop]}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>Today</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Security</Text>
          </View>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>Change Password</Text>
          </Pressable>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>Two-Factor Authentication</Text>
          </Pressable>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>🔔 Notifications</Text>
          </Pressable>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>🌙 Dark Mode</Text>
          </Pressable>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>🌍 Language</Text>
          </Pressable>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Help & Support</Text>
          </View>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>💬 Contact Support</Text>
          </Pressable>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>📋 Terms & Conditions</Text>
          </Pressable>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>🔒 Privacy Policy</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFA500",
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
