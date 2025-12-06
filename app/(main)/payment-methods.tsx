import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaymentMethod {
  id: string;
  type: "card" | "wallet";
  name: string;
  details: string;
  isPrimary: boolean;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      name: "Visa Card",
      details: "**** **** **** 1234",
      isPrimary: true,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const addPaymentMethod = () => {
    if (!cardName || !cardNumber) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const newMethod: PaymentMethod = {
      id: String(paymentMethods.length + 1),
      type: "card",
      name: cardName,
      details: `**** **** **** ${cardNumber.slice(-4)}`,
      isPrimary: false,
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setCardName("");
    setCardNumber("");
    setShowAddModal(false);
    Alert.alert("Success", "Payment method added");
  };

  const setPrimary = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isPrimary: method.id === id,
      }))
    );
    Alert.alert("Success", "Primary payment method updated");
  };

  const deleteMethod = (id: string) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            setPaymentMethods(
              paymentMethods.filter((m) => m.id !== id)
            );
          },
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
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <Text style={styles.headerSubtitle}>
            {paymentMethods.length} payment method{paymentMethods.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Payment Methods List */}
        <View style={styles.section}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentCard}>
              <View style={styles.cardInfo}>
                <View style={styles.cardIcon}>
                  <Text style={styles.icon}>
                    {method.type === "card" ? "💳" : "💰"}
                  </Text>
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardName}>{method.name}</Text>
                  <Text style={styles.cardNumber}>{method.details}</Text>
                  {method.isPrimary && (
                    <Text style={styles.primaryBadge}>Primary payment method</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardActions}>
                {!method.isPrimary && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => setPrimary(method.id)}
                  >
                    <Text style={styles.actionButtonText}>Set Primary</Text>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteMethod(method.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Add Payment Method Button */}
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </Pressable>

        {/* Payment Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Settings</Text>
          <Pressable style={styles.settingCard}>
            <Text style={styles.settingIcon}>🔒</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Auto-Recharge Wallet</Text>
              <Text style={styles.settingDescription}>
                Automatically refill wallet when balance is low
              </Text>
            </View>
            <Text style={styles.settingToggle}>🔘</Text>
          </Pressable>

          <Pressable style={styles.settingCard}>
            <Text style={styles.settingIcon}>📱</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Payment Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified for every transaction
              </Text>
            </View>
            <Text style={styles.settingToggle}>✓</Text>
          </Pressable>
        </View>

        {/* Billing History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionIcon}>🚗</Text>
              <View>
                <Text style={styles.transactionName}>Ride to Downtown</Text>
                <Text style={styles.transactionDate}>Today at 2:30 PM</Text>
              </View>
            </View>
            <Text style={styles.transactionAmount}>-$15.00</Text>
          </View>

          <View style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionIcon}>🚗</Text>
              <View>
                <Text style={styles.transactionName}>Ride to Airport</Text>
                <Text style={styles.transactionDate}>Yesterday at 9:00 AM</Text>
              </View>
            </View>
            <Text style={styles.transactionAmount}>-$35.00</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., My Visa Card"
                  value={cardName}
                  onChangeText={setCardName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={16}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Expiry</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    maxLength={3}
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>

              <Pressable
                style={styles.confirmButton}
                onPress={addPaymentMethod}
              >
                <Text style={styles.confirmButtonText}>Add Payment Method</Text>
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
  section: {
    marginHorizontal: 16,
    marginTop: 20,
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
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  cardNumber: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  primaryBadge: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  deleteButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ff6b6b",
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 20,
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
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  settingDescription: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  settingToggle: {
    fontSize: 14,
  },
  transactionItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  transactionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  transactionName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  transactionDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ff6b6b",
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
  inputRow: {
    flexDirection: "row",
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
