import React, { useState } from 'react';
import { View, Text,  StyleSheet,Switch } from 'react-native';
import Navbar from '../../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';



export default function Profile() {

  const[isSwitchOn, setIsSwitchOn]=useState(false);

  const toggleSwitch =()=>{
    setIsSwitchOn(!isSwitchOn)
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>
          Number
        </Text>
        <Switch trackColor={{false:'red',true:'green'}} thumbColor={isSwitchOn? 'green':'red'} onValueChange={toggleSwitch} value={isSwitchOn}/>
        <Text> {isSwitchOn?"You are active":'You are inactive'}</Text>
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
  ProfileVeiw:{

  },
});
