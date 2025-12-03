import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";

interface SignupFormData {
  phone_number: string;
  password: string;
}

export type AppRoutes = {
  home: undefined;
  login: undefined;
};

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const schema = Yup.object({
    phone_number: Yup.string()
      .matches(/^[0-9]{11}$/, "Phone number must be 11 digits")
      .required("Phone number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://10.246.56.13:8000/api/accounts/login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Login successful!");
        router.push("/driver/home");
      } else {
        alert(result.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>

        
          <Controller
            control={control}
            name="phone_number"
            render={({ field }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  maxLength={11}
                />
                {errors.phone_number && (
                  <Text style={styles.error}>
                    {errors.phone_number.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {errors.password && (
                  <Text style={styles.error}>{errors.password.message}</Text>
                )}
              </>
            )}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/driver/signup")}
            style={{ marginTop: 15 }}
          >
            <Text style={{ color: "orange", textAlign: "center" }}>
              Don't have an account? Create account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "orange",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 5,
    borderColor: "orange",
    borderRadius: 20,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "orange",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginBottom: 5,
    fontSize: 13,
  },
});
