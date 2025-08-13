import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Pagination from "./PaginationDots";
import colors from "../styles/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CAROUSEL_WIDTH = SCREEN_WIDTH - 40;
const CAROUSEL_HEIGHT = 180;
const IMAGE_RADIUS = 12;

interface CarouselSectionProps {
  slides: ImageSourcePropType[];
}

export default function CarouselSection({ slides }: CarouselSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.wrapper}>
      <Carousel
        loop
        autoPlay
        width={CAROUSEL_WIDTH}
        height={CAROUSEL_HEIGHT}
        data={slides}
        scrollAnimationDuration={500}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <Image source={item} style={styles.image} resizeMode="cover" />
        )}
      />
      <Pagination
        total={slides.length}
        activeIndex={activeIndex}
        activeColor={colors.red}
        inactiveColor={colors.gray}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: colors.white,
  },
  image: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: IMAGE_RADIUS,
    borderWidth: 2,
    borderColor: colors.red,
  },
});
