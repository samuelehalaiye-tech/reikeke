import React from 'react';
import { View, Text,  StyleSheet } from 'react-native';
import Navbar from '../../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AboutUs() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
            About Us
        </Text>
        <Text style={styles.paragraph}>
            Hello My name is Onaopemipo Samuel Ehalaiye the creator of this application you use today.
            I created reikeke to solve the fundemental problem of the public transport system in nigeria
            by the way there is no us in the app . I developed it by myself and put About Us to fulfil all righteousness
            I hope you enjoy the app thank you 
        </Text>
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
    paddingTop: 20,  
    paddingHorizontal: 16,
    paddingBottom: 60, 
    alignItems: 'center', 
  },
  title: {
    fontSize: 40,
    fontWeight: 900,
    color: "orange",
    textAlign: 'center',
    marginBottom: 12, 
  },
  paragraph: {
    fontSize: 25,
    color: '#333',
    textAlign: 'center',
    fontWeight:600,
  },
});
