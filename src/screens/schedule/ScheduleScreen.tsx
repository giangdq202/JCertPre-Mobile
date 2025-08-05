import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
} from "react-native";
import moment from "moment";
import "moment/locale/vi";
import { Ionicons } from "@expo/vector-icons";

const background = require("../../assets/schedule.jpg");

type Lesson = {
  id: string;
  title: string;
  time: string;
  description?: string;
};

type WeekSchedule = {
  [date: string]: Lesson[];
};

// Dummy data
const scheduleData: WeekSchedule = {
  "2025-08-04": [
    {
      id: "1",
      title: "Ngữ pháp N5",
      time: "08:00 - 09:30",
      description: "Học cấu trúc câu và mẫu ngữ pháp thường gặp.",
    },
    {
      id: "2",
      title: "Từ vựng N5",
      time: "10:00 - 11:30",
      description: "Học từ mới theo chủ đề gia đình và trường học.",
    },
  ],
  "2025-08-05": [
    {
      id: "3",
      title: "Đọc hiểu N5",
      time: "13:00 - 14:30",
      description: "Luyện đọc đoạn văn ngắn và trả lời câu hỏi.",
    },
  ],
  "2025-08-06": [],
  "2025-08-07": [
    {
      id: "4",
      title: "Luyện nghe N5",
      time: "08:00 - 09:30",
      description: "Nghe đoạn hội thoại ngắn và luyện phản xạ.",
    },
  ],
  "2025-08-08": [],
  "2025-08-09": [
    {
      id: "5",
      title: "Ôn tập N5",
      time: "14:00 - 15:30",
      description: "Ôn tổng hợp kiến thức tuần và luyện đề JLPT.",
    },
  ],
  "2025-08-10": [],
};

const ScheduleScreen = () => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const getWeekDates = () => {
    const startOfWeek = moment()
      .startOf("isoWeek")
      .add(currentWeekOffset, "weeks");
    return [...Array(7)].map((_, i) =>
      moment(startOfWeek).add(i, "days").format("YYYY-MM-DD")
    );
  };

  const weekDates = getWeekDates();
  const startDate = moment(weekDates[0]).format("DD/MM");
  const endDate = moment(weekDates[6]).format("DD/MM");

  const renderLesson = (lesson: Lesson) => (
    <View key={lesson.id} style={styles.lessonCard}>
      <Text style={styles.lessonTitle}>{lesson.title}</Text>
      <Text style={styles.lessonTime}>{lesson.time}</Text>
      {lesson.description && (
        <Text style={styles.lessonDesc}>{lesson.description}</Text>
      )}
    </View>
  );

  const renderDay = (date: string) => {
    const dayLabel = moment(date).format("dddd (DD/MM)");
    const lessons = scheduleData[date] || [];

    return (
      <View key={date} style={styles.dayContainer}>
        <Text style={styles.dayTitle}>{dayLabel}</Text>
        {lessons.length > 0 ? (
          lessons.map(renderLesson)
        ) : (
          <Text style={styles.noLesson}>Không có lịch học</Text>
        )}
      </View>
    );
  };

  return (
    <ImageBackground source={background} style={styles.bgImage}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setCurrentWeekOffset((prev) => prev - 1)}
          >
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {startDate} - {endDate}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentWeekOffset((prev) => prev + 1)}
          >
            <Ionicons name="chevron-forward" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={weekDates}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderDay(item)}
          contentContainerStyle={styles.contentContainer}
        />
      </View>
    </ImageBackground>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  contentContainer: {
    paddingBottom: 100,
  },
  dayContainer: {
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  lessonCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  lessonTime: {
    fontSize: 14,
    color: "#374151",
    marginTop: 2,
  },
  lessonDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  noLesson: {
    fontStyle: "italic",
    color: "#9ca3af",
  },
});
