import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  ScrollView,
  StatusBar,
  ImageBackground,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type RootStackParamList = {
  GrammarDetail: { groupId: string; title: string };
};

type GrammarDetailRouteProp = RouteProp<RootStackParamList, "GrammarDetail">;

const grammarData: Record<
  string,
  {
    id: string;
    structure: string;
    form: string;
    meaning: string;
    usage: string;
    example: string;
  }[]
> = {
  n5: [
    {
      id: "1",
      structure: "〜は〜です",
      form: "Danh từ + は + Danh từ + です",
      meaning: "Là ~",
      usage: "Dùng để khẳng định chủ ngữ là một danh từ nào đó.",
      example: "わたしは がくせいです。 (Tôi là học sinh.)",
    },
    {
      id: "2",
      structure: "〜ませんか",
      form: "Động từ thể ます + ませんか",
      meaning: "Rủ rê, mời mọc",
      usage: "Dùng để mời người nghe cùng làm gì đó.",
      example: "いっしょに いきませんか。 (Cùng đi nhé?)",
    },
    {
      id: "3",
      structure: "〜があります／います",
      form: "Danh từ + が + あります／います",
      meaning: "Có ~",
      usage: "あります dùng cho vật, います dùng cho người và động vật.",
      example: "つくえのうえにほんがあります。 (Trên bàn có sách.)",
    },
  ],
  n4: [
    {
      id: "1",
      structure: "〜ながら",
      form: "Động từ thể ます + ながら",
      meaning: "Vừa ~ vừa ~",
      usage: "Diễn tả hai hành động xảy ra đồng thời.",
      example:
        "おんがくをききながらべんきょうします。 (Vừa học vừa nghe nhạc.)",
    },
    {
      id: "2",
      structure: "〜てはいけません",
      form: "Động từ thể て + はいけません",
      meaning: "Không được ~",
      usage: "Diễn tả sự cấm đoán.",
      example:
        "ここでたばこをすってはいけません。 (Không được hút thuốc ở đây.)",
    },
  ],
  n3: [
    {
      id: "1",
      structure: "〜ようにする",
      form: "Động từ nguyên mẫu + ようにする",
      meaning: "Cố gắng để ~",
      usage: "Thể hiện sự nỗ lực, cố gắng duy trì một thói quen hay hành vi.",
      example:
        "まいにちうんどうするようにしています。 (Tôi cố gắng tập thể dục mỗi ngày.)",
    },
    {
      id: "2",
      structure: "〜ことになっている",
      form: "Động từ nguyên mẫu + ことになっている",
      meaning: "Theo quy định/ theo dự định",
      usage: "Diễn tả những quy định, thói quen hoặc dự định theo kế hoạch.",
      example:
        "あしたはかいぎをすることになっています。 (Ngày mai có cuộc họp.)",
    },
  ],
  n2: [
    {
      id: "1",
      structure: "〜に違いない",
      form: "Danh từ/Động từ/Tính từ + に違いない",
      meaning: "Chắc chắn là ~",
      usage: "Dùng khi người nói tin chắc phán đoán của mình là đúng.",
      example:
        "かれはしらないふりをしているに違いない。 (Anh ta chắc chắn đang giả vờ không biết.)",
    },
    {
      id: "2",
      structure: "〜ざるを得ない",
      form: "Động từ thể ない + ざるを得ない",
      meaning: "Đành phải ~ / không thể không ~",
      usage: "Dùng khi bắt buộc phải làm, dù không muốn.",
      example:
        "じかんがないのでいそがざるを得ない。 (Vì không có thời gian nên buộc phải vội vàng.)",
    },
  ],
  n1: [
    {
      id: "1",
      structure: "〜に至るまで",
      form: "Danh từ + に至るまで",
      meaning: "Đến cả ~ / cho đến ~",
      usage: "Dùng để nhấn mạnh phạm vi bao quát, kể cả chi tiết nhỏ.",
      example:
        "かれのしゅみはえんぴつのいろに至るまでこだわっている。 (Sở thích của anh ấy kỹ lưỡng đến cả màu của bút chì.)",
    },
    {
      id: "2",
      structure: "〜を余儀なくされる",
      form: "Danh từ + を余儀なくされる",
      meaning: "Buộc phải ~",
      usage: "Dùng khi bị ép buộc làm gì đó ngoài ý muốn.",
      example:
        "あめのため、イベントは中止を余儀なくされた。 (Do mưa nên sự kiện buộc phải hủy.)",
    },
  ],
};

// Component card riêng
const GrammarCard = ({ item }: { item: (typeof grammarData.n5)[0] }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    Animated.spring(animatedValue, {
      toValue: flipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  return (
    <Pressable onPress={flipCard} style={styles.cardContainer}>
      {/* Mặt trước */}
      <Animated.View
        style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}
        pointerEvents={flipped ? "none" : "auto"}
      >
        <Text style={styles.structure}>{item.structure}</Text>
        <Text style={styles.meaning}>{item.meaning}</Text>
      </Animated.View>

      {/* Mặt sau */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { transform: [{ rotateY: backInterpolate }] },
        ]}
        pointerEvents={flipped ? "auto" : "none"}
      >
        <ScrollView>
          <Text style={styles.label}>📌 Cấu trúc:</Text>
          <Text style={styles.detail}>{item.form}</Text>

          <Text style={styles.label}>💡 Ý nghĩa:</Text>
          <Text style={styles.detail}>{item.meaning}</Text>

          <Text style={styles.label}>📝 Cách dùng:</Text>
          <Text style={styles.detail}>{item.usage}</Text>

          <Text style={styles.label}>🔎 Ví dụ:</Text>
          <Text style={styles.detail}>{item.example}</Text>
        </ScrollView>
      </Animated.View>
    </Pressable>
  );
};

const GrammarDetailScreen = () => {
  const route = useRoute<GrammarDetailRouteProp>();
  const navigation = useNavigation();
  const { groupId, title } = route.params;
  const data = grammarData[groupId] || [];

  return (
    <ImageBackground
      source={require("../../assets/flashcard.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#f9f9f9" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={({ item }) => <GrammarCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    marginBottom: 20,
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minHeight: 300, 
    justifyContent: "center",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  structure: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },
  meaning: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },
});

export default GrammarDetailScreen;
