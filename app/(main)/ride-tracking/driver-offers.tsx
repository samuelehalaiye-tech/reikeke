// app/(main)/driver-offers.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api } from "../../../services/api";

type Offer = {
  id: number;
  ride: number;
  driver_phone?: string;
  status: string;
 
};

export default function DriverOffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);

  const loadOffers = async () => {
    try {
      const res = await api.get("/rides/offers/");
      setOffers(res || []);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    loadOffers();
    const t = setInterval(loadOffers, 5000);
    return () => clearInterval(t);
  }, []);

  const accept = async (id: number) => {
    await api.post(`/rides/offers/${id}/accept/`, {});
    Alert.alert("Accepted");
    loadOffers();
  };

  const reject = async (id: number) => {
    await api.post(`/rides/offers/${id}/reject/`, {});
    Alert.alert("Rejected");
    loadOffers();
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={offers}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: "700" }}>Offer #{item.id}</Text>
            <Text>Status: {item.status}</Text>

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: "green" }]} onPress={() => accept(item.id)}>
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: "red" }]} onPress={() => reject(item.id)}>
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 14, marginBottom: 12, borderRadius: 8, elevation: 1 },
  btn: { flex: 1, padding: 10, borderRadius: 8, marginRight: 6 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
