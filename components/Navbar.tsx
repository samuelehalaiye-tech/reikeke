import React from 'react'
import { useRouter } from 'expo-router'
import { View,Pressable,Text,StyleSheet } from 'react-native'
import { isProtectedReactElement } from 'expo-router/build/views/Protected'
import { Ionicons } from "@expo/vector-icons";



function Navbar() {
    const router = useRouter()
  return (
    <View style={styles.container}>
        <Pressable onPress={()=> router.push("/driver/Home")}>
            <Ionicons name='home' size={26} color='orange'/>
        </Pressable>
        <Pressable onPress={()=> router.push("/driver/Offers")}>
            <Ionicons name='bookmarks' size={26} color='orange'/>
        </Pressable>
        <Pressable onPress={()=> router.push("/driver/Profile")}>
            <Ionicons name='person' size={26} color='orange'/>
        </Pressable>
        <Pressable onPress={()=> router.push("/driver/AboutUs")}>
            <Ionicons name='add-circle'size={26} color='orange'/>
        </Pressable>
    </View>
  )
}

const styles =StyleSheet.create({
    container:{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#1E1E1E",
        position: "absolute",
        bottom: 0,
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
})
export default Navbar
