    import React from 'react';
    import "expo-router/entry";
    import { View, Text, StyleSheet, Pressable,Image } from 'react-native';
    import { SafeAreaView } from 'react-native-safe-area-context';
    import {useRouter} from "expo-router"
function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/images/reikeke.png")} style={styles.image} />
      <Text style={styles.title}>Welcome to Reikeke!</Text>
      <Text style={styles.subtitle}>Press get started to continue</Text>
      <Pressable style={({pressed})=>[styles.button,pressed&&styles.buttonPressed]} onPress={()=>router.push("/auth/RoleSelectionScreen")}>
          <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: 'white'
  },

  title:{
    fontSize:32,
    fontWeight:"900",
    marginBottom:10,
  },
  subtitle:{
    fontSize:18,
    marginBottom:20,
    color:"#333"
  },
  button:{
    paddingVertical: 20,
    paddingHorizontal: 80,
    borderRadius: 30,
    backgroundColor: 'orange',
  },
  buttonText:{
    fontSize:20,
    color:"white",
    fontWeight:900,

  },
  buttonPressed: {
    backgroundColor: '#CC5500',
    transform: [{ scale: 0.97 }]
  },
  image:{
    width:350,
    height:200,
    marginBottom:20,
    borderRadius:100,
  }
})
export default WelcomeScreen