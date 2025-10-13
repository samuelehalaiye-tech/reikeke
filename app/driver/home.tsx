import React from 'react';
import { View, Text,  StyleSheet } from 'react-native';
import Navbar from '../../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import UpperTab from '../../components/UpperTab';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <UpperTab/>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Home!</Text>
      </View>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingBottom: 60, // gives space for the navbar
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
