import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export default function SavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([
    {
      id: "1",
      name: "Home",
      address: "123 Main St, Downtown",
      latitude: 40.7128,
      longitude: -74.006,
      isDefault: true,
    },
    {
      id: "2",
      name: "Work",
      address: "456 Business Ave, Financial District",
      latitude: 40.7614,
      longitude: -73.9776,
      isDefault: false,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  const addLocation = () => {
    if (!locationName || !locationAddress) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const newLocation: SavedLocation = {
      id: String(locations.length + 1),
      name: locationName,
      address: locationAddress,
      latitude: 40.7128 + Math.random() * 0.1,
      longitude: -74.006 + Math.random() * 0.1,
      isDefault: locations.length === 0,
    };

    setLocations([...locations, newLocation]);
    setLocationName("");
    setLocationAddress("");
    setShowAddModal(false);
    Alert.alert("Success", "Location saved");
  };

  const setAsDefault = (id: string) => {
    setLocations(
      locations.map((loc) => ({
        ...loc,
        isDefault: loc.id === id,
      }))
    );
    Alert.alert("Success", "Default location updated");
  };

  const deleteLocation = (id: string) => {
    Alert.alert(
      "Delete Location",
      "Are you sure you want to delete this location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            setLocations(locations.filter((l) => l.id !== id));
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderLocationItem = ({ item }: { item: SavedLocation }) => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <View style={styles.locationNameContainer}>
          <Text style={styles.locationIcon}>
            {item.name === "Home" ? "🏠" : item.name === "Work" ? "💼" : "📍"}
          </Text>
          <View style={styles.locationNameSection}>
            <Text style={styles.locationName}>{item.name}</Text>
            {item.isDefault && (
              <Text style={styles.defaultBadge}>Default location</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.coordinates}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => Alert.alert("Navigate", `Opening maps for ${item.name}`)}
        >
          <Text style={styles.actionBtnIcon}>📍</Text>
          <Text style={styles.actionBtnText}>Navigate</Text>
        </Pressable>

        {!item.isDefault && (
          <Pressable
            style={styles.actionBtn}
            onPress={() => setAsDefault(item.id)}
          >
            <Text style={styles.actionBtnIcon}>⭐</Text>
            <Text style={styles.actionBtnText}>Set Default</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => deleteLocation(item.id)}
        >
          <Text style={styles.actionBtnIcon}>🗑️</Text>
          <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Locations</Text>
          <Text style={styles.headerSubtitle}>
            {locations.length} location{locations.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Locations List */}
        {locations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>No saved locations</Text>
            <Text style={styles.emptySubtext}>
              Save your favorite places for quick access
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={locations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        {/* Add Location Button */}
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add New Location</Text>
        </Pressable>

        {/* Quick Location Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Type Suggestions</Text>
          <View style={styles.suggestionGrid}>
            <Pressable
              style={styles.suggestionCard}
              onPress={() => {
                setLocationName("Home");
                setShowAddModal(true);
              }}
            >
              <Text style={styles.suggestionIcon}>🏠</Text>
              <Text style={styles.suggestionText}>Home</Text>
            </Pressable>

            <Pressable
              style={styles.suggestionCard}
              onPress={() => {
                setLocationName("Work");
                setShowAddModal(true);
              }}
            >
              <Text style={styles.suggestionIcon}>💼</Text>
              <Text style={styles.suggestionText}>Work</Text>
            </Pressable>

            <Pressable
              style={styles.suggestionCard}
              onPress={() => {
                setLocationName("Gym");
                setShowAddModal(true);
              }}
            >
              <Text style={styles.suggestionIcon}>🏋️</Text>
              <Text style={styles.suggestionText}>Gym</Text>
            </Pressable>

            <Pressable
              style={styles.suggestionCard}
              onPress={() => {
                setLocationName("School");
                setShowAddModal(true);
              }}
            >
              <Text style={styles.suggestionIcon}>🎓</Text>
              <Text style={styles.suggestionText}>School</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Location Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setLocationName("");
          setLocationAddress("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Location</Text>
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  setLocationName("");
                  setLocationAddress("");
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Home, Work, Gym"
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter full address"
                  value={locationAddress}
                  onChangeText={setLocationAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Pressable
                style={styles.confirmButton}
                onPress={addLocation}
              >
                <Text style={styles.confirmButtonText}>Save Location</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  listContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  listContent: {
    gap: 12,
  },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  locationHeader: {
    marginBottom: 10,
  },
  locationNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationNameSection: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  defaultBadge: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 2,
  },
  addressContainer: {
    marginBottom: 10,
  },
  address: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  coordinates: {
    fontSize: 11,
    color: "#999",
    fontFamily: "monospace",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  deleteBtn: {
    backgroundColor: "#ffebee",
  },
  actionBtnIcon: {
    fontSize: 14,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  deleteBtnText: {
    color: "#ff6b6b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
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
  },
  addButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    backgroundColor: "#FFA500",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  suggestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionCard: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    elevation: 1,
  },
  suggestionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#888",
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: "#333",
  },
  textArea: {
    textAlignVertical: "top",
  },
  confirmButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
