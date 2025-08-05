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
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ImageBackground } from "react-native";
import backgroundImage from "../../assets/home.jpg";

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
    title: "Từ vựng",
    icon: "book-open-page-variant",
    color: "#81C784",
  },
  {
    id: "2",
    title: "Ngữ pháp",
    icon: "file-document-outline",
    color: "#FFB74D",
  },
  {
    id: "3",
    title: "Kanji",
    icon: "translate",
    color: "#E57373",
  },
  {
    id: "4",
    title: "Luyện thi",
    icon: "medal-outline",
    color: "#C0CA33",
  },
];

const courses = [
  {
    id: 1,
    title: "JLPT N5 Complete Course - Beginner Japanese",
    description:
      "Khoá học chuẩn bị toàn diện cho kỳ thi JLPT N5, bao gồm hiragana, katakana, 100 chữ kanji cơ bản, các mẫu ngữ pháp thiết yếu và hơn 800 từ vựng. Phù hợp với người mới bắt đầu.",
    price: 1500000,
    thumbnail: require("../../assets/course1.png"),
  },
  {
    id: 2,
    title: "JLPT N4 Intermediate Course",
    description:
      "Nâng cao ngữ pháp và từ vựng cho trình độ JLPT N4. Tập trung vào các cấu trúc câu và từ vựng trung cấp, giúp bạn giao tiếp tự tin hơn.",
    price: 1800000,
    thumbnail: require("../../assets/course2.png"),
  },
  {
    id: 3,
    title: "JLPT N3 Advanced Course",
    description:
      "Khoá học luyện thi JLPT N3 với ngữ pháp nâng cao, từ vựng chuyên sâu và luyện tập Kanji tầm trung. Dành cho người học muốn đạt trình độ trung cấp cao.",
    price: 2100000,
    thumbnail: require("../../assets/course3.png"),
  },
  {
    id: 4,
    title: "Luyện thi JLPT N2 chuyên sâu",
    description:
      "Khoá học chuyên sâu chuẩn bị cho JLPT N2, tập trung vào đọc hiểu, nghe hiểu và sử dụng ngữ pháp phức tạp. Dành cho người học có nền tảng vững chắc.",
    price: 2500000,
    thumbnail: require("../../assets/course4.png"),
  },
  {
    id: 5,
    title: "Luyện thi JLPT N1 cấp tốc",
    description:
      "Khoá học cấp tốc dành cho kỳ thi JLPT N1, luyện tập các đề thi thử, từ vựng nâng cao và kỹ năng đọc hiểu sâu. Phù hợp với người học trình độ cao.",
    price: 2800000,
    thumbnail: require("../../assets/course5.png"),
  },
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");

  const renderSlide = (slide: any, index: number) => (
    <Image
      key={index}
      source={slide}
      style={styles.slideImage}
      resizeMode="cover"
    />
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.categoryItem, { borderColor: item.color }]}
      activeOpacity={0.7}
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
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#777"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Tìm kiếm khóa học, từ vựng..."
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#777"
              />
            </View>

            {/* Carousel */}
            <View>
              <Carousel
                loop
                autoPlay
                width={width - 32}
                height={200}
                data={slides}
                scrollAnimationDuration={10000}
                renderItem={({ item }) => (
                  <Image
                    source={item}
                    style={{
                      width: width - 32,
                      height: 200,
                      borderRadius: 14,
                    }}
                    resizeMode="cover"
                  />
                )}
              />
            </View>

            <Text style={styles.welcomeText}>
              Cùng <Text style={styles.highlight}>JCertPre</Text> khám phá thế
              giới tiếng Nhật một cách tự nhiên và dễ dàng!
            </Text>

            {/* Danh mục */}
            <View style={styles.categoriesContainer}>
              {categories.map((item) => renderCategory({ item }))}
            </View>

            {/* Tiêu đề section khóa học */}
            <View style={styles.courseSection}>
              <Text style={styles.sectionTitle}>Khóa học nổi bật</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>
              Tại sao nên học tiếng Nhật với chúng tôi?
            </Text>
            <Text style={styles.infoText}>
              • Chương trình biên soạn chuẩn JLPT, cập nhật liên tục.
              {"\n"}• Giảng viên kinh nghiệm, hỗ trợ tận tình 24/7.
              {"\n"}• Tài liệu đa dạng: video, bài tập tương tác, luyện đề thi
              thật.
              {"\n"}• Cộng đồng học viên đông đảo, hỗ trợ nhau phát triển.
            </Text>
          </View>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 48,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 48,
  },

  searchIcon: {
    marginRight: 10,
    color: "#777",
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },

  slideImage: {
    width: width,
    height: 200,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#444",
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 20,
    lineHeight: 26,
    fontStyle: "italic",
  },
  highlight: {
    fontWeight: "700",
    color: "#2ECC71",
  },
  categoriesContainer: {
    paddingHorizontal: 16, // thay vì margin
    marginBottom: 24,
    flexDirection: "row",
    flexWrap: "wrap", // cần wrap nếu muốn xuống dòng
    justifyContent: "space-between",
  },

  categoryItem: {
    width: (width - 32 - 4 * 4) / 5, // 32 = padding 16*2, 4 khoảng cách giữa các item
    height: 90,
    backgroundColor: "#F0F0F0",
    borderRadius: 14,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  courseSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#FAFAF2",
    borderRadius: 16,
    marginBottom: 20,
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  courseImage: {
    width: 100,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: "cover",
    backgroundColor: "#e0f2f1",
  },

  courseTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1B5E20",
    marginBottom: 4,
  },

  courseDesc: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 6,
  },

  coursePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E57373",
  },

  infoSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 15.5,
    color: "#444",
    lineHeight: 26,
    textAlign: "justify",
    opacity: 0.95,
  },
});
