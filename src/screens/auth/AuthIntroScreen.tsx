import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import * as Animatable from "react-native-animatable";

import logo from "../../assets/logo.png";
import background from "../../assets/background_login.jpg";

const PRIMARY_COLOR = "#66BB6A";
const SECONDARY_COLOR = "#fff";
const ACCENT_COLOR = "#4CAF50";

const AuthIntroScreen = ({ navigation }: any) => {
  return (
    <ImageBackground source={background} style={styles.background}>
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Logo */}
        <Animatable.View
          animation="zoomIn"
          delay={200}
          duration={800}
          style={styles.logoWrapper}
          easing="ease-out"
        >
          <Image source={logo} style={styles.logo} />
        </Animatable.View>

        {/* Title */}
        <Animatable.Text
          animation="fadeInDown"
          delay={400}
          duration={600}
          style={styles.title}
        >
          Chào mừng đến với <Text style={styles.accentText}>JCertPre</Text>
        </Animatable.Text>

        {/* Subtitle */}
        <Animatable.Text
          animation="fadeInDown"
          delay={600}
          duration={600}
          style={styles.subtitle}
        >
          Nền tảng học & luyện thi JLPT chuyên sâu
        </Animatable.Text>

        {/* Buttons */}
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          duration={600}
          style={styles.buttonGroup}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Login")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Register")}
            style={styles.outlinedButton}
          >
            <Text style={styles.outlinedButtonText}>Đăng ký</Text>
          </TouchableOpacity>
        </Animatable.View>
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
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 60,
  },

  logoWrapper: {
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 100,
    padding: 10,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    resizeMode: "contain",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: SECONDARY_COLOR,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 36,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  accentText: {
    color: ACCENT_COLOR,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },

  subtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  buttonGroup: {
    width: "100%",
  },

  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 9,
  },

  primaryButtonText: {
    color: SECONDARY_COLOR,
    fontSize: 18,
    fontWeight: "700",
  },

  outlinedButton: {
    backgroundColor: "rgba(255,255,255,0.87)",
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  outlinedButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: "700",
  },
});
