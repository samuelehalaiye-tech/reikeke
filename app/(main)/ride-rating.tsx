import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function RideRating() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const submitRating = () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    Alert.alert("Success", "Thank you for your feedback!", [
      {
        text: "OK",
        onPress: () => router.push("/(main)/home"),
      },
    ]);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Text style={[styles.star, rating >= star ? styles.starActive : null]}>
              ★
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rate Your Ride</Text>
        </View>

        {/* Ride Summary */}
        <View style={styles.rideCard}>
          <View style={styles.rideInfo}>
            <Text style={styles.rideLabel}>Ride Details</Text>
            <Text style={styles.rideId}>Ride #12345</Text>
            <Text style={styles.rideDetails}>Pickup: Downtown</Text>
            <Text style={styles.rideDetails}>Dropoff: Airport</Text>
            <Text style={styles.rideCost}>Cost: $25.00</Text>
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>John Smith</Text>
              <Text style={styles.driverPhone}>+1 (555) 123-4567</Text>
              <View style={styles.carInfo}>
                <Text style={styles.carDetails}>Toyota Camry • Blue • ABC-123</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your ride?</Text>
          <View style={styles.ratingCard}>
            {renderStars()}
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabel}>Poor</Text>
              <Text style={styles.ratingLabel}>Good</Text>
              <Text style={styles.ratingLabel}>Great</Text>
            </View>
          </View>
        </View>

        {/* Rating Categories */}
        {rating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What could improve?</Text>
            <View style={styles.categoriesGrid}>
              {[
                { icon: "🚗", label: "Vehicle Cleanliness" },
                { icon: "🛣️", label: "Route Quality" },
                { icon: "🎵", label: "Driver Behavior" },
                { icon: "⏱️", label: "Ride Duration" },
              ].map((category, index) => (
                <Pressable key={index} style={styles.categoryBadge}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Feedback Section */}
        {rating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Comments</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Share your experience... (optional)"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Tip Section */}
        {rating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add a Tip</Text>
            <View style={styles.tipGrid}>
              {["$2", "$5", "$10", "Custom"].map((tip) => (
                <Pressable key={tip} style={styles.tipButton}>
                  <Text style={styles.tipText}>{tip}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.actionContainer}>
          <Pressable
            style={[
              styles.submitButton,
              { opacity: rating === 0 ? 0.5 : 1 },
            ]}
            onPress={submitRating}
            disabled={rating === 0}
          >
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          </Pressable>

          <Pressable
            style={styles.skipButton}
            onPress={() => router.push("/(main)/home")}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </View>

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
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  rideCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  rideInfo: {
    gap: 6,
  },
  rideLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  rideId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  rideDetails: {
    fontSize: 12,
    color: "#666",
  },
  rideCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFA500",
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  driverCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    elevation: 1,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: {
    fontSize: 28,
  },
  driverInfo: {
    flex: 1,
    justifyContent: "center",
  },
  driverName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  driverPhone: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  carInfo: {
    marginTop: 4,
  },
  carDetails: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  ratingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 1,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
    color: "#ddd",
  },
  starActive: {
    color: "#FFD700",
  },
  ratingLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
  },
  ratingLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "500",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryBadge: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    elevation: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  feedbackInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    fontSize: 13,
    color: "#333",
    elevation: 1,
  },
  tipGrid: {
    flexDirection: "row",
    gap: 10,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 1,
  },
  tipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFA500",
  },
  actionContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    gap: 10,
  },
  submitButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  skipButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
});
