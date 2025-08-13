import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import colors from "../styles/colors";

interface CourseCardProps {
  thumbnail: ImageSourcePropType;
  title: string;
  description: string;
  price: number;
  onPress: () => void;
}

function CourseCard({
  thumbnail,
  title,
  description,
  price,
  onPress,
}: CourseCardProps) {
  return (
    <View style={styles.card}>
      <Image source={thumbnail} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.desc} numberOfLines={3}>
          {description}
        </Text>
        <Text style={styles.price}>{price.toLocaleString()} VNĐ</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Học ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(CourseCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    margin: 8,
    width: 250,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 130,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkGray,
  },
  desc: {
    fontSize: 12,
    color: colors.gray,
    marginVertical: 4,
    lineHeight: 16,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.red,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.pink,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
});
