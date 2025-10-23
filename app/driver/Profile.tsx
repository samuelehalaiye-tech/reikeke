import React, { useState } from 'react';
import { View, Text,  StyleSheet,Switch } from 'react-native';
import Navbar from '../../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';




export default function Profile() {

  const[isSwitchOn, setIsSwitchOn]=useState(false);

  const toggleSwitch =()=>{
    setIsSwitchOn(!isSwitchOn)
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Switch trackColor={{false:'grey',true:'green'}} thumbColor={isSwitchOn? ' #FFA500':'grey'} onValueChange={toggleSwitch} value={isSwitchOn} style={styles.swicth}/>
        <Text style={styles.swicthText}> {isSwitchOn?"You are active":'You are inactive'}</Text>
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
  swicth:{
    transform:[{scale:2.0}],
    marginVertical:10,
  },
  swicthText:{
    fontSize:40,
    fontWeight:900,
    color:'orange'
  },
});
