import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useAuth } from "../../auth/AuthContext";
import Toast from "react-native-toast-message";
import * as Animatable from "react-native-animatable";

const logo = require("../../assets/logo.png");

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const Login: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useAuth();

  const onSubmit = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập đầy đủ email và mật khẩu.",
      });
      return;
    }

    try {
      setIsLoading(true);
      await handleLogin(email.trim(), password);
      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công!",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: "Tài khoản hoặc mật khẩu không đúng.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f0fdf4", "#ffffff"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("AuthIntroScreen")}
          >
            <Ionicons name="chevron-back" size={28} color="#14532d" />
          </TouchableOpacity>

          {/* Logo + Tiêu đề */}
          <View style={styles.logoContainer}>
            <Animatable.View
              animation="zoomIn"
              delay={200}
              style={styles.logoWrapper}
            >
              <Image source={logo} style={styles.logo} />
            </Animatable.View>

            <Animatable.Text
              animation="fadeInDown"
              delay={400}
              style={styles.title}
            >
              Chào mừng trở lại!
            </Animatable.Text>

            <Animatable.Text
              animation="fadeInDown"
              delay={600}
              style={styles.subtitle}
            >
              Đăng nhập để tiếp tục hành trình học tiếng Nhật của bạn
            </Animatable.Text>
          </View>

          {/* Form đăng nhập */}
          <Animatable.View
            animation="fadeInUp"
            delay={800}
            style={styles.inputContainer}
          >
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={{ marginBottom: 14 }}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}> Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  scroll: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 50,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    borderRadius: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#14532d",
  },
  subtitle: {
    textAlign: "center",
    color: "#374151",
    marginTop: 8,
    fontSize: 15,
    paddingHorizontal: 20,
    fontWeight: "500",
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontWeight: "600",
    color: "#14532d",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
    color: "#000",
    backgroundColor: "#f9fafb",
  },

  inputWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 10,
  },

  loginButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#15803d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: "center",
    color: "#15803d",
    fontSize: 14,
    marginTop: 6,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#4b5563",
    fontSize: 14,
  },
  registerLink: {
    color: "#15803d",
    fontSize: 14,
    fontWeight: "bold",
  },
});
