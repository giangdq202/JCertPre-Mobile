import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
} from "react-native";

import Carousel from "react-native-reanimated-carousel";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import backgroundImage from "../../assets/home.png";
import { AppStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

const slides = [
  require("../../assets/slide1.png"),
  require("../../assets/slide2.png"),
  require("../../assets/slide3.png"),
];

const courseImages = [
  require("../../assets/course1.png"),
  require("../../assets/course2.png"),
  require("../../assets/course3.png"),
  require("../../assets/course4.png"),
  require("../../assets/course5.png"),
];

const categories = [
  {
    id: "1",
    title: "Flashcard",
    icon: "book-open-page-variant",
    color: "#81C784",
  },
  {
    id: "2",
    title: "Ngữ pháp",
    icon: "file-document-outline",
    color: "#FFB74D",
  },
  { id: "3", title: "Kanji", icon: "translate", color: "#E57373" },
  { id: "4", title: "Luyện thi", icon: "medal-outline", color: "#C0CA33" },
];

// Dữ liệu khóa học
const courses = [
  {
    id: 1,
    title: "JLPT N5 Complete Course - Beginner Japanese",
    description:
      "Khoá học chuẩn bị toàn diện cho kỳ thi JLPT N5, bao gồm hiragana, katakana, 100 chữ kanji cơ bản, các mẫu ngữ pháp thiết yếu và hơn 800 từ vựng. Phù hợp với người mới bắt đầu.",
    price: 1_500_000,
    thumbnail: require("../../assets/course5.png"),
  },
  {
    id: 2,
    title: "JLPT N4 Intermediate Course",
    description:
      "Nâng cao ngữ pháp và từ vựng cho trình độ JLPT N4. Tập trung vào các cấu trúc câu và từ vựng trung cấp, giúp bạn giao tiếp tự tin hơn.",
    price: 1_800_000,
    thumbnail: require("../../assets/course4.png"),
  },
  {
    id: 3,
    title: "JLPT N3 Advanced Course",
    description:
      "Khoá học luyện thi JLPT N3 với ngữ pháp nâng cao, từ vựng chuyên sâu và luyện tập Kanji tầm trung. Dành cho người học muốn đạt trình độ trung cấp cao.",
    price: 2_100_000,
    thumbnail: require("../../assets/course3.png"),
  },
  {
    id: 4,
    title: "Luyện thi JLPT N2 chuyên sâu",
    description:
      "Khoá học chuyên sâu chuẩn bị cho JLPT N2, tập trung vào đọc hiểu, nghe hiểu và sử dụng ngữ pháp phức tạp. Dành cho người học có nền tảng vững chắc.",
    price: 2_500_000,
    thumbnail: require("../../assets/course2.png"),
  },
  {
    id: 5,
    title: "Luyện thi JLPT N1 cấp tốc",
    description:
      "Khoá học cấp tốc dành cho kỳ thi JLPT N1, luyện tập các đề thi thử, từ vựng nâng cao và kỹ năng đọc hiểu sâu. Phù hợp với người học trình độ cao.",
    price: 2_800_000,
    thumbnail: require("../../assets/course1.png"),
  },
];

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [searchText, setSearchText] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Render từng slide carousel
  const renderSlide = (slide: any, index: number) => (
    <Image
      key={index}
      source={slide}
      style={styles.slideImage}
      resizeMode="cover"
    />
  );

  // Render từng mục danh mục
  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.categoryItem, { borderColor: item.color }]}
      activeOpacity={0.7}
      onPress={() => {
        if (item.title === "Flashcard") {
          navigation.navigate("Flashcard");
        }
      }}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={36}
        color={item.color}
        style={{ marginBottom: 6 }}
      />
      <Text style={[styles.categoryText, { color: item.color }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  // Render từng card khóa học
  const renderCourse = ({ item }: { item: any }) => (
    <View style={styles.courseCard} key={item.id}>
      <Image source={item.thumbnail} style={styles.courseImage} />
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.courseDesc} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.coursePrice}>
          {item.price.toLocaleString()} VNĐ
        </Text>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#A0A0A0"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Tìm kiếm khóa học, từ vựng..."
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#B0B0B0"
                returnKeyType="search"
              />
            </View>

            <Carousel
              loop
              autoPlay
              width={width - 40}
              height={180}
              data={slides}
              scrollAnimationDuration={2000}
              renderItem={({ item }) => (
                <View style={styles.carouselItem}>
                  <Image
                    source={item}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                  <View style={styles.carouselOverlay} />
                </View>
              )}
              onSnapToItem={(index) => setActiveIndex(index)}
            />
            <View style={styles.pagination}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex && styles.activeDot]}
                />
              ))}
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>
              Cùng <Text style={styles.welcomeHighlight}>JCertPre</Text> khám
              phá thế giới tiếng Nhật một cách tự nhiên và dễ dàng!
            </Text>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              {categories.map((item) => renderCategory({ item }))}
            </View>

            {/* Section Title */}
            <View style={styles.sectionTitleWrapper}>
              <Text style={styles.sectionTitle}>Khóa học nổi bật</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>
              Tại sao nên học tiếng Nhật với chúng tôi?
            </Text>
            <View>
              {[
                "Chương trình biên soạn chuẩn JLPT, cập nhật liên tục.",
                "Giảng viên kinh nghiệm, hỗ trợ tận tình 24/7.",
                "Tài liệu đa dạng: video, bài tập tương tác, luyện đề thi thật.",
                "Cộng đồng học viên đông đảo, hỗ trợ nhau phát triển.",
              ].map((text, i) => (
                <Text key={i} style={styles.infoText}>
                  • {text}
                </Text>
              ))}
            </View>
          </View>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 48,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 16,
    shadowColor: "transparent",
    elevation: 0,
  },

  searchIcon: {
    marginRight: 10,
    color: "#A0A0A0",
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#3C3C3C",
    fontWeight: "400",
    paddingVertical: 0,
    fontFamily: "System",
  },

  carouselWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 28,
    backgroundColor: "#F9FAFB",
    shadowColor: "#00000020",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  carouselImage: {
    width: width - 40,
    height: 180,
    borderRadius: 12,
  },

  carouselItem: {
    borderRadius: 16,
    overflow: "hidden",
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  activeDot: {
    backgroundColor: "#F8BBD0", // Sakura pastel
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    shadowColor: "#F8BBD0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  dot: {
    backgroundColor: "#FCE4EC", // Hồng nhạt hơn cho dot chưa active
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#4A5A6A", // xám xanh trầm ấm
    marginTop: 12,
    marginBottom: 20,
    marginHorizontal: 20,
    lineHeight: 26,
    fontStyle: "italic",
  },

  welcomeHighlight: {
    fontWeight: "700",
    color: "#66BB6A", // xanh lá làm điểm nhấn tươi sáng
  },

  highlight: {
    fontWeight: "700",
    color: "#66BB6A",
  },

  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  categoryItem: {
    width: (width - 32 - 4 * 4) / 5,
    height: 78,
    backgroundColor: "#F7FAFC", // nền trắng ngả xanh nhẹ
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E2EC", // viền xám xanh nhẹ, thanh thoát
    shadowColor: "#00000011",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: "#52796F", // xanh lá tối nhẹ, không quá nổi bật
  },

  courseSection: {
    marginBottom: 24,
  },

  sectionTitleWrapper: {
    marginBottom: 14,
    marginHorizontal: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#375A53", // xanh đậm trầm để làm tiêu đề
    letterSpacing: 0.5,
    lineHeight: 28,
  },

  courseCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF", // nền trắng sạch
    borderRadius: 16,
    marginBottom: 20,
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#D9E2EC", // viền nhẹ màu xám xanh
    shadowColor: "#00000011",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  courseImage: {
    width: 100,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: "cover",
    backgroundColor: "#E3F1DF", // nền xanh lá rất nhạt, dịu mắt khi ảnh chưa tải
  },

  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#375A53", // xanh đậm để nổi bật vừa phải
    marginBottom: 6,
  },

  courseDesc: {
    fontSize: 14,
    color: "#63707D", // xám xanh vừa phải, dễ đọc
    lineHeight: 20,
    marginBottom: 8,
  },

  coursePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4C956C", // xanh lá nhẹ nhàng, làm nổi bật giá
  },

  infoSection: {
    backgroundColor: "#F0FAF4", // xanh nhạt làm nền nhẹ nhàng
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 22,
    marginTop: 40,
    marginBottom: 60,
    shadowColor: "#66BB6A33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#375A53",
    marginBottom: 18,
    letterSpacing: 0.4,
  },

  infoText: {
    fontSize: 15,
    color: "#506870",
    lineHeight: 26,
    marginBottom: 10,
  },

  slideImage: {
    width: width - 40,
    height: 180,
    borderRadius: 16,
  },
});
