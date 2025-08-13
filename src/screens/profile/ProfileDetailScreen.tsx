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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { updateUser, updateUserAvatar } from "../../services/userService";

const primaryColor = "#32CD32"; // Màu chủ đạo đồng bộ

const ProfileDetail = () => {
  const navigation = useNavigation();
  const { userInfo, setUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userInfo?.fullName || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar */}
      <TouchableOpacity
        onPress={handlePickImage}
        style={styles.avatarContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color={primaryColor} />
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
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Số điện thoại"
              keyboardType="numeric"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name="checkmark-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Ionicons name="close-outline" size={20} color="#333" />
                <Text style={[styles.btnText, { color: "#333" }]}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Họ tên:</Text>
              <Text>{userInfo?.fullName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text>{userInfo?.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>SĐT:</Text>
              <Text>{userInfo?.phone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vai trò:</Text>
              <Text>{userInfo?.roleName}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  changeAvatar: { marginTop: 8, fontSize: 14, color: primaryColor },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { fontWeight: "600", color: "#374151" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginBottom: 16,
    paddingVertical: 6,
    fontSize: 16,
  },
  editBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: primaryColor,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: primaryColor,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonRow: { flexDirection: "row", marginTop: 16 },
  btnText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
});

export default ProfileDetail;
