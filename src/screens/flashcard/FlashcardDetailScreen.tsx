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
  // --- N5 ---
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

  // --- N4 ---
  "5": [
    { front: "会社", back: "Công ty" },
    { front: "病院", back: "Bệnh viện" },
    { front: "駅", back: "Nhà ga" },
    { front: "道", back: "Con đường" },
    { front: "店", back: "Cửa hàng" },
    { front: "雨", back: "Mưa" },
    { front: "雪", back: "Tuyết" },
    { front: "風", back: "Gió" },
    { front: "空港", back: "Sân bay" },
    { front: "海", back: "Biển" },
  ],
  "6": [
    { front: "〜なければならない", back: "Phải..." },
    { front: "〜たり〜たりする", back: "Lúc thì... lúc thì..." },
    { front: "〜てみる", back: "Thử làm..." },
    { front: "〜ほうがいい", back: "Nên..." },
    { front: "〜すぎる", back: "Quá..." },
    { front: "〜やすい", back: "Dễ..." },
    { front: "〜にくい", back: "Khó..." },
    { front: "〜ことになる", back: "Được quyết định là..." },
    { front: "〜ようになる", back: "Trở nên có thể..." },
    { front: "〜ながら", back: "Vừa... vừa..." },
  ],
  "7": [
    { front: "試験", back: "Kỳ thi" },
    { front: "卒業", back: "Tốt nghiệp" },
    { front: "結婚", back: "Kết hôn" },
    { front: "旅行", back: "Du lịch" },
    { front: "運転", back: "Lái xe" },
    { front: "料理", back: "Nấu ăn" },
    { front: "勉強", back: "Học tập" },
    { front: "質問", back: "Câu hỏi" },
    { front: "答え", back: "Câu trả lời" },
    { front: "会議", back: "Cuộc họp" },
  ],
  "8": [
    { front: "お元気ですか", back: "Bạn có khỏe không?" },
    { front: "少々お待ちください", back: "Xin vui lòng đợi một chút" },
    { front: "いくらですか", back: "Bao nhiêu tiền?" },
    { front: "お願いします", back: "Xin vui lòng" },
    { front: "大丈夫です", back: "Không sao đâu" },
    { front: "すごいですね", back: "Tuyệt quá nhỉ" },
    { front: "そう思います", back: "Tôi cũng nghĩ vậy" },
    { front: "本当ですか", back: "Thật không?" },
    { front: "気をつけて", back: "Hãy cẩn thận" },
    { front: "頑張って", back: "Cố gắng nhé" },
  ],

  // --- N3 ---
  "9": [
    { front: "環境", back: "Môi trường" },
    { front: "経済", back: "Kinh tế" },
    { front: "政治", back: "Chính trị" },
    { front: "歴史", back: "Lịch sử" },
    { front: "文化", back: "Văn hóa" },
    { front: "教育", back: "Giáo dục" },
    { front: "科学", back: "Khoa học" },
    { front: "技術", back: "Kỹ thuật" },
    { front: "情報", back: "Thông tin" },
    { front: "社会", back: "Xã hội" },
  ],
  "10": [
    { front: "〜ようにする", back: "Cố gắng để..." },
    { front: "〜らしい", back: "Có vẻ như..." },
    { front: "〜みたい", back: "Giống như..." },
    { front: "〜はず", back: "Chắc hẳn..." },
    { front: "〜べき", back: "Nên..." },
    { front: "〜場合", back: "Trong trường hợp..." },
    { front: "〜たばかり", back: "Vừa mới..." },
    { front: "〜ところ", back: "Đúng lúc..." },
    { front: "〜ように言う", back: "Bảo rằng hãy..." },
    { front: "〜てもかまわない", back: "Dù có... cũng không sao" },
  ],
  "11": [
    { front: "感情", back: "Cảm xúc" },
    { front: "経験", back: "Kinh nghiệm" },
    { front: "結果", back: "Kết quả" },
    { front: "原因", back: "Nguyên nhân" },
    { front: "目的", back: "Mục đích" },
    { front: "方法", back: "Phương pháp" },
    { front: "安全", back: "An toàn" },
    { front: "必要", back: "Cần thiết" },
    { front: "重要", back: "Quan trọng" },
    { front: "自然", back: "Tự nhiên" },
  ],
  "12": [
    { front: "お世話になります", back: "Cảm ơn đã giúp đỡ" },
    { front: "ご苦労様です", back: "Cảm ơn vất vả của bạn" },
    { front: "よろしくお願いします", back: "Rất mong giúp đỡ" },
    { front: "お疲れ様です", back: "Cảm ơn vì sự vất vả" },
    { front: "失礼します", back: "Xin phép" },
    { front: "お願いします", back: "Xin vui lòng" },
    { front: "おめでとうございます", back: "Chúc mừng" },
    { front: "そうですね", back: "Đúng vậy nhỉ" },
    { front: "大変ですね", back: "Khó khăn nhỉ" },
    { front: "頑張ってください", back: "Hãy cố gắng nhé" },
  ],

  // --- N2 ---
  "13": [
    { front: "価値", back: "Giá trị" },
    { front: "責任", back: "Trách nhiệm" },
    { front: "判断", back: "Phán đoán" },
    { front: "影響", back: "Ảnh hưởng" },
    { front: "課題", back: "Vấn đề" },
    { front: "基準", back: "Tiêu chuẩn" },
    { front: "可能", back: "Khả năng" },
    { front: "条件", back: "Điều kiện" },
    { front: "効果", back: "Hiệu quả" },
    { front: "資源", back: "Tài nguyên" },
  ],
  "14": [
    { front: "〜わけではない", back: "Không hẳn là..." },
    { front: "〜とは限らない", back: "Không nhất thiết..." },
    { front: "〜に違いない", back: "Chắc chắn là..." },
    { front: "〜において", back: "Tại, trong..." },
    { front: "〜に関して", back: "Liên quan đến..." },
    { front: "〜に比べて", back: "So với..." },
    { front: "〜に加えて", back: "Thêm vào đó..." },
    { front: "〜に応じて", back: "Ứng với..." },
    { front: "〜に基づいて", back: "Dựa trên..." },
    { front: "〜に従って", back: "Theo, tùy vào..." },
  ],
  "15": [
    { front: "現実", back: "Hiện thực" },
    { front: "理想", back: "Lý tưởng" },
    { front: "主張", back: "Chủ trương" },
    { front: "提案", back: "Đề xuất" },
    { front: "交渉", back: "Đàm phán" },
    { front: "支援", back: "Hỗ trợ" },
    { front: "対策", back: "Đối sách" },
    { front: "報告", back: "Báo cáo" },
    { front: "予測", back: "Dự đoán" },
    { front: "発展", back: "Phát triển" },
  ],
  "16": [
    { front: "よろしくお願いいたします", back: "Rất mong nhận được giúp đỡ" },
    { front: "ご迷惑をおかけします", back: "Xin lỗi vì làm phiền" },
    { front: "お先に失礼します", back: "Xin phép về trước" },
    { front: "どうぞお幸せに", back: "Chúc hạnh phúc" },
    { front: "ご安心ください", back: "Xin hãy yên tâm" },
    { front: "ご自由にどうぞ", back: "Xin cứ tự nhiên" },
    { front: "ご協力お願いします", back: "Mong được hợp tác" },
    { front: "お手数ですが", back: "Phiền bạn..." },
    { front: "お疲れのところ", back: "Lúc bạn đang mệt" },
    { front: "お気をつけください", back: "Xin hãy cẩn thận" },
  ],

  // --- N1 ---
  "17": [
    { front: "抽象", back: "Trừu tượng" },
    { front: "概念", back: "Khái niệm" },
    { front: "矛盾", back: "Mâu thuẫn" },
    { front: "象徴", back: "Biểu tượng" },
    { front: "理論", back: "Lý luận" },
    { front: "構造", back: "Cấu trúc" },
    { front: "傾向", back: "Khuynh hướng" },
    { front: "前提", back: "Tiền đề" },
    { front: "仮説", back: "Giả thuyết" },
    { front: "根拠", back: "Căn cứ" },
  ],
  "18": [
    { front: "〜に足る", back: "Đáng để..." },
    { front: "〜にひきかえ", back: "Trái lại..." },
    { front: "〜に即して", back: "Theo đúng..." },
    { front: "〜をおいて", back: "Ngoài... thì không" },
    { front: "〜を限りに", back: "Kể từ..." },
    { front: "〜を皮切りに", back: "Khởi đầu từ..." },
    { front: "〜をめぐって", back: "Xoay quanh..." },
    { front: "〜をもって", back: "Lấy... làm" },
    { front: "〜をものともせず", back: "Bất chấp..." },
    { front: "〜を余儀なくされる", back: "Buộc phải..." },
  ],
  "19": [
    { front: "錯覚", back: "Ảo giác" },
    { front: "従属", back: "Phụ thuộc" },
    { front: "概況", back: "Tình hình chung" },
    { front: "至難", back: "Cực kỳ khó khăn" },
    { front: "切実", back: "Cấp bách" },
    { front: "悠長", back: "Ung dung" },
    { front: "顕著", back: "Nổi bật" },
    { front: "過密", back: "Quá đông đúc" },
    { front: "希薄", back: "Loãng, thưa thớt" },
    { front: "精巧", back: "Tinh xảo" },
  ],
  "20": [
    { front: "石の上にも三年", back: "Có công mài sắt có ngày nên kim" },
    { front: "猿も木から落ちる", back: "Người tài giỏi cũng có lúc mắc lỗi" },
    { front: "二兎を追う者は一兎をも得ず", back: "Tham thì thâm" },
    { front: "七転び八起き", back: "Thất bại là mẹ thành công" },
    { front: "蓼食う虫も好き好き", back: "Mỗi người một sở thích" },
    { front: "塵も積もれば山となる", back: "Góp gió thành bão" },
    { front: "雨降って地固まる", back: "Sau cơn mưa trời lại sáng" },
    { front: "猫に小判", back: "Đàn gảy tai trâu" },
    { front: "花より団子", back: "Thực tế hơn hình thức" },
    { front: "井の中の蛙", back: "Ếch ngồi đáy giếng" },
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
              color={currentIndex === 0 ? "#ccc" : "#A3E635"}
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
                  : "#A3E635"
              }
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
