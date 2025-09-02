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

const COLORS = {
  primaryGreen: "#66BB6A",
  white: "#FFFFFF",
  grayLight: "#F7FAF6",
  grayMedium: "#B0C4A5",
  grayDark: "#506B43",
  greenLight: "#DFF4E1",
  greenShadow: "rgba(102, 187, 106, 0.3)",
  textShadow: "rgba(0, 0, 0, 0.1)",
};

const Login: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useAuth();

  const onSubmit = async () => {
    if (!email.trim() || !password) {
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
    } catch {
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
    <LinearGradient
      colors={[COLORS.white, COLORS.greenLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("AuthIntroScreen")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={COLORS.primaryGreen}
              style={{
                textShadowColor: COLORS.textShadow,
                textShadowRadius: 3,
              }}
            />
          </TouchableOpacity>

          {/* Logo & Titles */}
          <View style={styles.logoSection}>
            <Animatable.View
              animation="zoomIn"
              delay={200}
              style={styles.logoWrapper}
              easing="ease-out"
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

          {/* Form */}
          <Animatable.View
            animation="fadeInUp"
            delay={800}
            style={styles.formContainer}
          >
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor={COLORS.grayMedium}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            {/* Password */}
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { paddingRight: 40 }]}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.grayMedium}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                textContentType="password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color={COLORS.primaryGreen}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                activeOpacity={0.7}
              >
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
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    paddingVertical: 48,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(102,187,106,0.15)",
    padding: 8,
    borderRadius: 30,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 9,
    marginBottom: 18,
  },
  logo: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primaryGreen,
    textShadowColor: COLORS.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 26,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    color: COLORS.primaryGreen,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.grayDark,
    borderWidth: 1,
    borderColor: COLORS.grayMedium,
    marginBottom: 22,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 18,
    top: 16,
  },
  loginButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 22,
    backgroundColor: COLORS.primaryGreen,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 9,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.greenLight,
  },
  loginButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.4,
  },
  forgotPasswordText: {
    color: COLORS.primaryGreen,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 26,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#707070",
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primaryGreen,
    fontWeight: "700",
    fontSize: 14,
  },
});
