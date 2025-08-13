import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../../navigation/types";

import backgroundImage from "../../assets/courses.jpg";
import {
  getCourses,
  CourseListDto,
  CourseLevel,
  CourseQueryParameters,
} from "../../services/courseService";

const levelLabels = ["N5", "N4", "N3", "N2", "N1"];

export default function CourseScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const params: CourseQueryParameters = {
        pageNumber: 1,
        pageSize: 20,
      };
      if (selectedLevel !== null) {
        params.level = selectedLevel as CourseLevel;
      }

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

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
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

        {/* Bộ lọc cấp độ */}
        <View style={styles.levelFilter}>
          {levelLabels.map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.levelButton,
                selectedLevel === index && styles.levelButtonSelected,
              ]}
              onPress={() =>
                setSelectedLevel(selectedLevel === index ? null : index)
              }
            >
              <Text
                style={[
                  styles.levelButtonText,
                  selectedLevel === index && styles.levelButtonTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#10b981"
            style={{ marginTop: 20 }}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.courseList}
            keyboardShouldPersistTaps="handled"
          >
            {filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.courseId}
                style={styles.card}
                onPress={() => navigation.navigate("CourseDetail", { course })}
              >
                <Image
                  source={{ uri: course.thumbnailUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.content}>
                  <Text style={styles.title}>{course.title}</Text>
                  <Text style={styles.description} numberOfLines={3}>
                    {course.description}
                  </Text>
                  <Text style={styles.price}>
                    {course.price.toLocaleString("vi-VN")} VND
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
  levelFilter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  levelButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },
  levelButtonSelected: {
    backgroundColor: "#10b981",
  },
  levelButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  levelButtonTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  courseList: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10b981",
  },
});
