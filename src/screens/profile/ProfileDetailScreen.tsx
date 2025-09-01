import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { updateUser, updateUserAvatar } from "../../services/userService";
import colors from "../../styles/colors";

const ProfileDetail = () => {
  const navigation = useNavigation();
  const { userInfo, setUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userInfo?.fullName || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [loading, setLoading] = useState(false);

  // chọn ảnh đại diện
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      if (userInfo?.id) {
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append("avatarFile", {
            uri: asset.uri,
            type: asset.mimeType || "image/jpeg",
            name: asset.fileName || `avatar_${Date.now()}.jpg`,
          } as any);

          const updated = await updateUserAvatar(userInfo.id, formData);
          setUserInfo({ ...userInfo, avatarUrl: updated.avatarUrl });
        } catch (error) {
          Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // lưu thông tin
  const handleSave = async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const updated = await updateUser(userInfo.id, { fullName, phone });
      setUserInfo({
        ...userInfo,
        fullName: updated.fullName,
        phone: updated.phone ?? "",
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/profile.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Header */}
      <LinearGradient colors={["#000000cc", "#00000055"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.container}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={handlePickImage}
          style={styles.avatarContainer}
        >
          <LinearGradient
            colors={[colors.primary, colors.lightBlue]}
            style={styles.avatarBorder}
          >
            {loading ? (
              <ActivityIndicator size="large" color={colors.white} />
            ) : (
              <Image
                source={
                  userInfo?.avatarUrl && userInfo.avatarUrl.trim() !== ""
                    ? { uri: userInfo.avatarUrl }
                    : require("../../assets/no-avatar.png")
                }
                style={styles.avatar}
              />
            )}
          </LinearGradient>
          <Text style={styles.changeAvatar}>Thay đổi ảnh</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoContainer}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Họ và tên"
                placeholderTextColor={colors.gray}
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Số điện thoại"
                keyboardType="numeric"
                placeholderTextColor={colors.gray}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleSave} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={[colors.primary, colors.green]}
                    style={styles.saveBtn}
                  >
                    <Ionicons
                      name="checkmark-outline"
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.btnText}>Lưu</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsEditing(false)}
                >
                  <Ionicons
                    name="close-outline"
                    size={20}
                    color={colors.darkGray}
                  />
                  <Text style={[styles.btnText, { color: colors.darkGray }]}>
                    Hủy
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {[
                { label: "Họ tên", value: userInfo?.fullName },
                { label: "Email", value: userInfo?.email },
                { label: "SĐT", value: userInfo?.phone },
                { label: "Vai trò", value: userInfo?.roleName },
              ].map((item, idx) => (
                <View key={idx} style={styles.row}>
                  <Text style={styles.label}>{item.label}:</Text>
                  <Text style={styles.value}>{item.value || "-"}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.white}
                />
                <Text style={styles.btnText}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    elevation: 6,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.white },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1, padding: 20 },
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatarBorder: {
    padding: 3,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray,
  },
  changeAvatar: { marginTop: 8, fontSize: 14, color: colors.primary },
  infoContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: { fontWeight: "600", color: colors.darkGray, fontSize: 15 },
  value: { color: colors.black, fontSize: 15 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginBottom: 20,
    paddingVertical: 8,
    fontSize: 16,
  },
  editBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  saveBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightBlue,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonRow: { flexDirection: "row", marginTop: 16 },
  btnText: { fontWeight: "600", marginLeft: 6, fontSize: 15 },
});

export default ProfileDetail;
