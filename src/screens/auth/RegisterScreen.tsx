import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { register } from "../../services/authService";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAvatarChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selected = result.assets[0];
      setAvatar({
        uri: selected.uri,
        name: selected.uri.split("/").pop(),
        type: "image/jpeg",
      });
    }
  };

  const handleSubmit = async () => {
    const { fullname, email, password, confirmPassword, phone } = formData;

    if (!fullname || !email || !password || !confirmPassword) {
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

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("FullName", fullname);
      payload.append("Email", email);
      payload.append("Password", password);
      if (phone) payload.append("Phone", phone);
      if (avatar) {
        payload.append("AvatarFile", {
          uri: avatar.uri,
          name: avatar.name,
          type: avatar.type,
        } as any);
      }

      const response = await register(payload);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đăng ký thành công!",
      });

      navigation.navigate("Login");
    } catch (error) {
      console.error("Register error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đăng ký thất bại. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>
          Tham gia hành trình học tiếng Nhật ngay hôm nay!
        </Text>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleAvatarChange}
        >
          {avatar ? (
            <Image source={{ uri: avatar.uri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={28} color="#aaa" />
              <Text style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}>
                Chọn ảnh
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={formData.fullname}
            onChangeText={(text) => handleInputChange("fullname", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => handleInputChange("email", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại (tùy chọn)"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => handleInputChange("phone", text)}
          />
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(text) =>
                handleInputChange("confirmPassword", text)
              }
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tạo tài khoản</Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <Text>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: "#E53935", fontWeight: "bold" }}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "700", color: "#66BB6A", marginBottom: 4 },
  subtitle: {
    fontSize: 14,
    color: "#506B43",
    marginBottom: 20,
    textAlign: "center",
  },
  avatarWrapper: { marginBottom: 20, alignItems: "center" },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#E53935",
  },
  inputContainer: { width: "100%" },
  input: {
    backgroundColor: "#F7FAF6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#B0C4A5",
  },
  passwordWrapper: { position: "relative", marginBottom: 12 },
  eyeIcon: { position: "absolute", right: 12, top: 12 },
  button: {
    backgroundColor: "#E53935",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default RegisterScreen;
