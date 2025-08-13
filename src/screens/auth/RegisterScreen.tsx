import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { register } from "../../services/authService";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

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
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const onSubmit = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Thông báo",
        text2: "Vui lòng nhập đầy đủ thông tin bắt buộc.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
        fullName,
        phone: phone,
      };

      await register(payload);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đăng ký thành công!",
      });

      navigation.navigate("Login");
    } catch (error: any) {
      console.error("Register error:", error);

      const message =
        error?.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại sau.";

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: message,
      });
    } finally {
      setIsLoading(false);
    }
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
    <LinearGradient
      colors={[COLORS.white, COLORS.greenLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 60}
      >
        <View style={styles.innerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("AuthIntroScreen")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={COLORS.primaryGreen}
              style={{
                textShadowColor: COLORS.textShadow,
                textShadowRadius: 3,
              }}
            />
          </TouchableOpacity>

          <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
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
                style={[
                  styles.registerButton,
                  isLoading && styles.registerButtonDisabled,
                ]}
                onPress={onSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
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
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

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
        placeholderTextColor={COLORS.grayMedium}
        {...props}
      />
      {hasToggle && onToggleVisibility && (
        <TouchableOpacity style={styles.eyeIcon} onPress={onToggleVisibility}>
          <Ionicons
            name={isVisible ? "eye" : "eye-off"}
            size={20}
            color={COLORS.grayMedium}
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.white },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
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
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primaryGreen,
    textShadowColor: COLORS.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.grayDark,
    marginTop: 5,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 13.5,
    color: COLORS.primaryGreen,
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.grayDark,
    borderWidth: 1,
    borderColor: COLORS.grayMedium,
    marginBottom: 16,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
  },
  registerButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    backgroundColor: COLORS.primaryGreen,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 9,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.greenLight,
  },
  registerText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.4,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  loginText: {
    color: COLORS.grayDark,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primaryGreen,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default Register;
