import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { View, Text, TextInput, Pressable,Image, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from 'react-native';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';


function signup() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [phone,setPhone]=useState("")
  const [code,setCode]=useState("")
  const [pendingVerification,setPendingVerification]=useState(false)
  async function handleSendCode() {
  if (!isLoaded || !signUp) return;

  if (!phone) {
    alert("Please enter a phone number");
    return;
  }

  // Clean the phone number:
  // 1. remove leading "+" if user types it
  // 2. remove leading zeros (E.164 format doesn’t allow them)
  const cleaned = phone.replace(/^\+/, "").replace(/^0+/, "");
  const e164Phone = `+${callingCode}${cleaned}`;

  console.log("E.164 phone:", e164Phone); // debug log

  try {
    await signUp.create({ phoneNumber: e164Phone });
    await signUp.preparePhoneNumberVerification();
    setPendingVerification(true);
  } catch (err) {
    console.error("Sign-up error:", err);
    alert("Failed to send verification code. Make sure your phone number is correct.");
  }
}


  async function handleVerifyCode(){
    if(!isLoaded||!signUp) return;

    const result= await signUp.attemptPhoneNumberVerification({code});
    console.log("verification result",result);

  }
  const [countryCode, setCountryCode] = useState<CountryCode>('NG');
  const [callingCode, setCallingCode] = useState('234');
  const [withCountryNameButton, setWithCountryNameButton] = useState(false);
 

  if (!isLoaded) return <Text style={{flex:1,alignItems:"center",justifyContent:"center", fontWeight:900,fontSize:20,color:"orange"}}>Loading...</Text>;
  return (
    <KeyboardAvoidingView style={{flex:1}} behavior="padding">
      <SafeAreaView style={styles.container}>
        <Image source={require("../assets/images/reikeke.png")} style={styles.image} />
        {!pendingVerification?(
        <>
        <View style={{gap:30}}>
          <Text style={styles.textPhone}>Enter your phone number:</Text>
          <CountryPicker
            countryCode={countryCode}
            withCallingCode
            withFlag
            withFilter
            withEmoji
            onSelect={(country) => {
            setCountryCode(country.cca2 as CountryCode);
            setCallingCode(country.callingCode[0]);
          }}
          />

          <TextInput placeholder="8123456789"  onChangeText={setPhone} value={phone} style={styles.input} keyboardType="phone-pad"/>

          <Pressable onPress={handleSendCode}style={({pressed})=>[styles.button,pressed&&styles.buttonPressed]}><Text style={styles.textButton}>Send Code</Text></Pressable>
        </View>
        </>):(
          <>
          <Text style={styles.textPhone}>Enter verification code</Text>
          <TextInput placeholder="123456" value={code} onChangeText={setCode}style={styles.input}/>
          <Pressable onPress={handleVerifyCode} style={({pressed})=>[styles.button,pressed&&styles.buttonPressed]}><Text style={styles.textButton}>Verify Code</Text></Pressable>
          </>
        )
        }
    </SafeAreaView>
  </KeyboardAvoidingView>
)

}

const styles=StyleSheet.create({
  container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center",
  },
  textPhone:{
    fontSize:24,
    fontWeight:900,
    color:"orange"
  },
  input:{
    borderColor:"orange",
    borderWidth:10,
    borderRadius:20,
    fontSize:16,
    width:200,
    alignSelf:"center"
  },
  button:{
    width:150,
    padding:10,
    backgroundColor:"orange",
    borderRadius:20,
    alignSelf:"center",

  },
  textButton:{
    alignSelf:"center",
    fontSize:20,
    fontWeight:900,
    color:"white"
  },
  buttonPressed: {
    backgroundColor: '#CC5500',
    transform: [{ scale: 0.97 }]
  },
  image:{
    height:80,
    width:350,
    borderRadius:100,
    marginBottom:20,
  },
})

export default signup