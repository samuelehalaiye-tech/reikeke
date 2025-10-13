import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Navbar() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Pressable onPress={() => router.push('/driver/Home')}>
          <Ionicons name='home' size={26} color='orange' />
        </Pressable>
        <Pressable onPress={() => router.push('/driver/Offers')}>
          <Ionicons name='bookmarks' size={26} color='orange' />
        </Pressable>
        <Pressable onPress={() => router.push('/driver/Profile')}>
          <Ionicons name='person' size={26} color='orange' />
        </Pressable>
        <Pressable onPress={() => router.push('/driver/AboutUs')}>
          <Ionicons name='add-circle' size={26} color='orange' />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom:0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});
