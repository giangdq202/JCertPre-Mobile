import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../styles/colors";

interface PaginationProps {
  total: number;
  activeIndex: number;
  activeColor?: string;
  inactiveColor?: string;
  size?: number;
}

export default function PaginationDots({
  total,
  activeIndex,
  activeColor = colors.pink,
  inactiveColor = colors.gray,
  size = 8,
}: PaginationProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: isActive ? activeColor : inactiveColor,
                transform: [{ scale: isActive ? 1.2 : 1 }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    marginHorizontal: 4,
  },
});
