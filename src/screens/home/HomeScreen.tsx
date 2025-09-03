import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import backgroundImage from "../../assets/home.png";
import { AppStackParamList } from "../../navigation/types";
import {
  getCourses,
  CourseListDto,
  CourseQueryParameters,
} from "../../services/courseService";
import SearchBar from "../../components/SearchBar";

const { width } = Dimensions.get("window");

const slides = [
  require("../../assets/slide1.png"),
  require("../../assets/slide2.png"),
  require("../../assets/slide3.png"),
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
  { id: "3", title: "Bảng chữ cái", icon: "translate", color: "#E57373" },
  { id: "4", title: "Quiz", icon: "brain", color: "#C0CA33" },
];

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [searchText, setSearchText] = useState("");
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: CourseQueryParameters = { pageNumber: 1, pageSize: 20 };
      const res = await getCourses(params);
      setCourses(res.items);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.categoryItem, { borderColor: item.color }]}
      onPress={() => {
        if (item.title === "Flashcard") {
          navigation.navigate("Flashcard");
        } else if (item.title === "Ngữ pháp") {
          navigation.navigate("Grammar");
        } else if (item.title === "Bảng chữ cái") {
          navigation.navigate("Alphabet");
        } else if (item.title === "Quiz") {
          navigation.navigate("QuizSetup");
        }
      }}
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

  const renderCourse = ({ item }: { item: CourseListDto }) => (
    <TouchableOpacity
      key={item.courseId}
      style={styles.courseCard}
      onPress={() => navigation.navigate("CourseDetail", { course: item })}
      activeOpacity={0.9}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailWrapper}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.courseImage}
          resizeMode="cover"
        />
        {/* Level Badge */}
        <View
          style={[
            styles.levelBadge,
            { backgroundColor: getLevelColor(item.level) },
          ]}
        >
          <Text style={styles.levelText}>
            {["N5", "N4", "N3", "N2", "N1"][item.level]}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.courseDesc} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Footer: Price + Button */}
        <View style={styles.courseFooter}>
          <View style={styles.priceTag}>
            <Text style={styles.coursePrice}>
              {item.price.toLocaleString("vi-VN")} VND
            </Text>
          </View>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getLevelColor = (level: number) => {
    const colors = ["#34D399", "#60A5FA", "#FBBF24", "#F87171", "#A78BFA"];
    return colors[level] || "#10b981";
  };

  // Loading State
  if (loading) {
    return (
      <View style={[styles.background, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Đang tải khóa học...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <FlatList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.courseId.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <View style={{ marginTop: 1 }}>
              <SearchBar
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Tìm khóa học..."
              />
            </View>

            {/* Carousel */}
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
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFFFFF" },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 120 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333", paddingVertical: 0 },
  carouselImage: { width: width - 40, height: 180, borderRadius: 12 },
  carouselItem: { borderRadius: 16, overflow: "hidden" },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  activeDot: {
    backgroundColor: "#10b981",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  dot: {
    backgroundColor: "#d1fae5",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#4A5A6A",
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 26,
    fontStyle: "italic",
  },
  welcomeHighlight: { fontWeight: "700", color: "#10b981" },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  categoryItem: {
    width: (width - 32 - 4 * 4) / 5,
    height: 78,
    backgroundColor: "#F7FAFC",
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E2EC",
  },
  categoryText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  sectionTitleWrapper: { marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#375A53" },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
  },

  thumbnailWrapper: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  courseImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: "#E3F1DF",
  },

  levelBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  levelText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },

  courseContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "space-between",
  },

  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },

  courseDesc: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 8,
    lineHeight: 18,
  },

  courseFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceTag: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  coursePrice: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },

  detailButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  detailButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4b5563",
  },
});
