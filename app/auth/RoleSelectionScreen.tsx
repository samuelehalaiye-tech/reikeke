import { View, Text, StyleSheet, Pressable, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function RoleSelectionScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/images/reikeke.png")} style={styles.image} />
      <Text style={styles.roleText}>Choose Your Role</Text>
      <View style={{gap:30}}>
        <Pressable style={({pressed})=>[styles.button,pressed&&styles.buttonPressed]} onPress={()=>router.push("/driver/signup")}>
          <Text style={styles.buttonText}>
            Driver
          </Text>
        </Pressable>
        <Pressable style={({pressed})=>[styles.button,pressed&&styles.buttonPressed]} onPress={()=>router.push("/auth/signup")}>
          <Text style={styles.buttonText}>
            Passenger
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    justifyContent:"center",
    alignItems:"center",
    flex:1,
    backgroundColor:"white"
  },
  image:{
    height:200,
    width:350,
    borderRadius:100,
    marginBottom:20,
  },
  roleText:{
    fontSize:20,
    marginBottom:60,
    fontWeight:500,
  },
  button:{
    paddingVertical: 20,
    paddingHorizontal: 80,
    borderRadius: 30,
    backgroundColor: 'orange',
    
  },
  buttonText:{
    fontSize:20,
    fontWeight:900,
    color:"white",
    
  },
  buttonPressed: {
    backgroundColor: '#CC5500',
    transform: [{ scale: 0.97 }]
  },
})
