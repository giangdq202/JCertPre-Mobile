import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageBackground } from "react-native";
import backgroundImage from "../../assets/flashcard.jpg";

type RootStackParamList = {
  Home: undefined;
  Flashcard: undefined;
  FlashcardDetail: { groupId: string; title: string };
};

type FlashcardScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "Flashcard"
>;

const flashcardGroups = [
  {
    id: "1",
    title: "Từ vựng N5",
    icon: "book-open-page-variant",
    color: "#A8D5BA",
    total: 20,
  },
  {
    id: "2",
    title: "Giao tiếp cơ bản",
    icon: "chat",
    color: "#A7C7E7",
    total: 10,
  },
  {
    id: "3",
    title: "Động từ cơ bản",
    icon: "run-fast",
    color: "#FFD6A5",
    total: 10,
  },
  {
    id: "4",
    title: "Ngữ pháp sơ cấp",
    icon: "file-document",
    color: "#D7BDE2",
    total: 10,
  },
  {
    id: "5",
    title: "Hán tự N5",
    icon: "translate",
    color: "#F5B7B1",
    total: 50,
  },
  {
    id: "6",
    title: "Mẫu câu hay dùng",
    icon: "format-quote-close",
    color: "#C5CAE9",
    total: 20,
  },
];

const FlashcardScreen = () => {
  const navigation = useNavigation<FlashcardScreenProp>();

  const renderItem = ({ item }: { item: (typeof flashcardGroups)[0] }) => {
    const scale = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() =>
          navigation.navigate("FlashcardDetail", {
            groupId: item.id,
            title: item.title,
          })
        }
      >
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale }], borderColor: item.color },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={26}
              color="#fff"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.total} thẻ</Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={28} color="#bbb" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Flashcard</Text>
        </View>

        <FlatList
          data={flashcardGroups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#fefefe",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f9f9f9",
    marginLeft: 16,
  },

  listContent: {
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
});

export default FlashcardScreen;
