import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const flashcardData: Record<string, { front: string; back: string }[]> = {
  "1": [
    { front: "犬", back: "Con chó" },
    { front: "猫", back: "Con mèo" },
    { front: "水", back: "Nước" },
    { front: "火", back: "Lửa" },
    { front: "山", back: "Núi" },
    { front: "空", back: "Bầu trời" },
    { front: "川", back: "Dòng sông" },
    { front: "田", back: "Ruộng" },
    { front: "木", back: "Cây" },
    { front: "花", back: "Hoa" },
    { front: "草", back: "Cỏ" },
    { front: "虫", back: "Côn trùng" },
    { front: "魚", back: "Cá" },
    { front: "鳥", back: "Chim" },
    { front: "人", back: "Người" },
    { front: "口", back: "Miệng" },
    { front: "目", back: "Mắt" },
    { front: "耳", back: "Tai" },
    { front: "手", back: "Tay" },
    { front: "足", back: "Chân" },
  ],
  "2": [
    { front: "こんにちは", back: "Xin chào" },
    { front: "ありがとう", back: "Cảm ơn" },
    { front: "さようなら", back: "Tạm biệt" },
    { front: "すみません", back: "Xin lỗi / Làm phiền" },
    { front: "おはよう", back: "Chào buổi sáng" },
    { front: "こんばんは", back: "Chào buổi tối" },
    { front: "はい", back: "Vâng" },
    { front: "いいえ", back: "Không" },
    { front: "お願いします", back: "Làm ơn" },
    { front: "大丈夫", back: "Không sao" },
  ],
  "3": [
    { front: "走る", back: "Chạy" },
    { front: "食べる", back: "Ăn" },
    { front: "飲む", back: "Uống" },
    { front: "書く", back: "Viết" },
    { front: "読む", back: "Đọc" },
    { front: "聞く", back: "Nghe" },
    { front: "見る", back: "Nhìn" },
    { front: "話す", back: "Nói" },
    { front: "買う", back: "Mua" },
    { front: "売る", back: "Bán" },
  ],
  "4": [
    { front: "〜です", back: "Thì, là..." },
    { front: "〜ます", back: "(thì) lịch sự" },
    { front: "〜ません", back: "Không (phủ định)" },
    { front: "〜でした", back: "Đã (quá khứ)" },
    { front: "〜ましょう", back: "Hãy (rủ rê)" },
    { front: "〜たい", back: "Muốn (làm gì)" },
    { front: "〜ている", back: "Đang (làm gì đó)" },
    { front: "〜ことがある", back: "Đã từng..." },
    { front: "〜ないでください", back: "Xin đừng..." },
    { front: "〜てもいいですか", back: "Tôi có thể... không?" },
  ],
};

const FlashcardDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { title, groupId } = route.params as { title: string; groupId: string };

  const sampleFlashcards = flashcardData[groupId] || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(!flipped);

  const handleNext = () => {
    if (currentIndex < sampleFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const currentCard = sampleFlashcards[currentIndex];

  return (
    <LinearGradient colors={["#FFEFBA", "#FFFFFF"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#444" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Card */}
        {currentCard ? (
          <TouchableOpacity
            onPress={handleFlip}
            activeOpacity={0.9}
            style={styles.card}
          >
            <Text style={styles.cardText}>
              {flipped ? currentCard.back : currentCard.front}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ marginTop: 40 }}>Không có dữ liệu thẻ.</Text>
        )}

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
            <Ionicons
              name="chevron-back-circle"
              size={48}
              color={currentIndex === 0 ? "#ccc" : "#A3E635"} // Màu xanh chuối
            />
          </TouchableOpacity>

          <Text style={styles.progress}>
            {currentIndex + 1} / {sampleFlashcards.length}
          </Text>

          <TouchableOpacity
            onPress={handleNext}
            disabled={currentIndex === sampleFlashcards.length - 1}
          >
            <Ionicons
              name="chevron-forward-circle"
              size={48}
              color={
                currentIndex === sampleFlashcards.length - 1
                  ? "#ccc"
                  : "#A3E635" // Màu xanh chuối
              }
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  card: {
    width: width * 0.85,
    height: width * 0.65,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 40,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  cardText: {
    fontSize: 36,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 48,
    alignItems: "center",
  },
  progress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});

export default FlashcardDetailScreen;
