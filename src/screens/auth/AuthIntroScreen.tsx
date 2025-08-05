import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Animatable from "react-native-animatable";

import logo from "../../assets/logo.png";
import background from "../../assets/background_login.jpg";

const { width, height } = Dimensions.get("window");

const AuthIntroScreen = ({ navigation }: any) => {
  return (
    <ImageBackground source={background} style={styles.background}>
      {/* Overlay mờ tối */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Logo hình tròn */}
        <Animatable.View
          animation="zoomIn"
          delay={200}
          duration={1200}
          style={styles.logoWrapper}
        >
          <Image source={logo} style={styles.logo} />
        </Animatable.View>

        {/* Text chính */}
        <Animatable.Text
          animation="fadeInDown"
          delay={400}
          style={styles.title}
        >
          Chào mừng đến với{" "}
          <Text style={{ color: "#4ade80", fontWeight: "bold" }}>JCertPre</Text>
        </Animatable.Text>

        <Animatable.Text
          animation="fadeInDown"
          delay={600}
          style={styles.subtitle}
        >
          Nền tảng học & luyện thi JLPT chuyên sâu
        </Animatable.Text>

        {/* Nhóm nút */}
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          style={styles.buttonGroup}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.outlinedButton]}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, styles.outlinedButtonText]}>
              Đăng ký
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        <StatusBar style="light" />
      </View>
    </ImageBackground>
  );
};

export default AuthIntroScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  logoWrapper: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 100,
    padding: 6,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: "#f3f4f6",
    textAlign: "center",
    marginBottom: 36,
  },
  buttonGroup: {
    width: "100%",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  outlinedButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  outlinedButtonText: {
    color: "#16a34a",
  },
});
