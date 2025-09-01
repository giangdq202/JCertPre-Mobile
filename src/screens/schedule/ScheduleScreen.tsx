import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import moment from "moment";
import "moment/locale/vi";
import { Ionicons } from "@expo/vector-icons";
import {
  livestreamApi,
  LivestreamTimetable,
} from "../../services/livestreamService";
import { useAuth } from "../../auth/AuthContext";

const background = require("../../assets/schedule.jpg");

type WeekSchedule = {
  [date: string]: LivestreamTimetable[];
};

const ScheduleScreen = () => {
  const { userInfo } = useAuth();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [scheduleData, setScheduleData] = useState<WeekSchedule>({});
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const data = await livestreamApi.getLivestreamsForEnrolledCourses(
          userInfo.id
        );
        const grouped: WeekSchedule = {};
        data.forEach((item) => {
          const date = moment(item.scheduledDateTime).format("YYYY-MM-DD");
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(item);
        });
        setScheduleData(grouped);
      } catch (error) {
        console.error("Error fetching livestream schedule:", error);
        setScheduleData({});
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [userInfo?.id, currentWeekOffset]);

  const renderLesson = (lesson: LivestreamTimetable) => {
    let statusLabel = "";
    let borderColor = "#10b981"; // scheduled

    switch (lesson.status) {
      case "ongoing":
        statusLabel = "Đang diễn ra";
        borderColor = "#f43f5e";
        break;
      case "completed":
        statusLabel = "Đã kết thúc";
        borderColor = "#9ca3af";
        break;
      default:
        statusLabel = "Sắp diễn ra";
    }

    return (
      <View
        key={lesson.livestreamId}
        style={[styles.lessonCard, { borderLeftColor: borderColor }]}
      >
        <Text style={styles.lessonTitle}>
          {lesson.courseName || "Khóa học"}
        </Text>
        <Text style={styles.lessonTime}>
          {moment(lesson.scheduledDateTime).format("HH:mm DD/MM/YYYY")}
        </Text>
        <Text style={styles.lessonDesc}>
          {lesson.description || "Buổi học trực tuyến"}
        </Text>
        <Text style={[styles.statusLabel, { color: borderColor }]}>
          {statusLabel}
        </Text>
      </View>
    );
  };

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

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ marginTop: 10 }}>Đang tải lịch học...</Text>
          </View>
        ) : (
          <FlatList
            data={weekDates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => renderDay(item)}
            contentContainerStyle={styles.contentContainer}
          />
        )}
      </View>
    </ImageBackground>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1, resizeMode: "cover" },
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
  headerText: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  contentContainer: { paddingBottom: 100 },
  dayContainer: {
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
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
  },
  lessonTitle: { fontSize: 15, fontWeight: "bold", color: "#1f2937" },
  lessonTime: { fontSize: 14, color: "#374151", marginTop: 2 },
  lessonDesc: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  noLesson: { fontStyle: "italic", color: "#9ca3af" },
  statusLabel: { marginTop: 4, fontWeight: "600" },
});
