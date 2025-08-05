import React, { useState, useRef, useEffect } from "react";
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
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";

const logo = require("../../assets/logo.png");

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const Register: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onSubmit = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Giả lập", "Đăng ký thành công.");
      navigation.navigate("Login");
    }, 1000);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={["#ecfdf5", "#ffffff"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("AuthIntroScreen")}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color="#14532d" />
          </TouchableOpacity>

          <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
            <View style={styles.logoWrapper}>
              <Image source={logo} style={styles.logo} />
            </View>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Tham gia hành trình học tiếng Nhật ngay hôm nay!
            </Text>
          </Animated.View>

          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
            <Input
              label="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              hasToggle
              onToggleVisibility={() => setShowPassword(!showPassword)}
              isVisible={showPassword}
            />

            <Input
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              hasToggle
              onToggleVisibility={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              isVisible={showConfirmPassword}
            />

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={onSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerText}>Đăng ký</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}> Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Custom Input Component
const Input = ({
  label,
  hasToggle = false,
  isVisible = false,
  onToggleVisibility,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  hasToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  [key: string]: any;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, hasToggle && { paddingRight: 40 }]}
        placeholderTextColor="#999"
        {...props}
      />
      {hasToggle && onToggleVisibility && (
        <TouchableOpacity style={styles.eyeIcon} onPress={onToggleVisibility}>
          <Ionicons
            name={isVisible ? "eye" : "eye-off"}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: 20,
    paddingBottom: 50,
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
    marginBottom: 28,
    marginTop: 60,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  logo: {
    width: 65,
    height: 65,
    resizeMode: "contain",
    borderRadius: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#14532d",
  },
  subtitle: {
    textAlign: "center",
    color: "#4b5563",
    marginTop: 6,
    fontSize: 13.5,
    paddingHorizontal: 16,
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    color: "#14532d",
    fontSize: 14,
    marginBottom: 6,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14.5,
    backgroundColor: "#f9f9f9",
    color: "#111",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 10,
  },
  registerButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  registerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15.5,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#555",
    fontSize: 14,
  },
  loginLink: {
    color: "#15803d",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Register;
