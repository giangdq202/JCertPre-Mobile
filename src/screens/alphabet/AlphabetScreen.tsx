import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const hiragana = [
  { id: "a", symbol: "あ", romaji: "a" },
  { id: "i", symbol: "い", romaji: "i" },
  { id: "u", symbol: "う", romaji: "u" },
  { id: "e", symbol: "え", romaji: "e" },
  { id: "o", symbol: "お", romaji: "o" },
  { id: "ka", symbol: "か", romaji: "ka" },
  { id: "ki", symbol: "き", romaji: "ki" },
  { id: "ku", symbol: "く", romaji: "ku" },
  { id: "ke", symbol: "け", romaji: "ke" },
  { id: "ko", symbol: "こ", romaji: "ko" },
  { id: "sa", symbol: "さ", romaji: "sa" },
  { id: "shi", symbol: "し", romaji: "shi" },
  { id: "su", symbol: "す", romaji: "su" },
  { id: "se", symbol: "せ", romaji: "se" },
  { id: "so", symbol: "そ", romaji: "so" },
  { id: "ta", symbol: "た", romaji: "ta" },
  { id: "chi", symbol: "ち", romaji: "chi" },
  { id: "tsu", symbol: "つ", romaji: "tsu" },
  { id: "te", symbol: "て", romaji: "te" },
  { id: "to", symbol: "と", romaji: "to" },
  { id: "na", symbol: "な", romaji: "na" },
  { id: "ni", symbol: "に", romaji: "ni" },
  { id: "nu", symbol: "ぬ", romaji: "nu" },
  { id: "ne", symbol: "ね", romaji: "ne" },
  { id: "no", symbol: "の", romaji: "no" },
  { id: "ha", symbol: "は", romaji: "ha" },
  { id: "hi", symbol: "ひ", romaji: "hi" },
  { id: "fu", symbol: "ふ", romaji: "fu" },
  { id: "he", symbol: "へ", romaji: "he" },
  { id: "ho", symbol: "ほ", romaji: "ho" },
  { id: "ma", symbol: "ま", romaji: "ma" },
  { id: "mi", symbol: "み", romaji: "mi" },
  { id: "mu", symbol: "む", romaji: "mu" },
  { id: "me", symbol: "め", romaji: "me" },
  { id: "mo", symbol: "も", romaji: "mo" },
  { id: "ya", symbol: "や", romaji: "ya" },
  { id: "yu", symbol: "ゆ", romaji: "yu" },
  { id: "yo", symbol: "よ", romaji: "yo" },
  { id: "ra", symbol: "ら", romaji: "ra" },
  { id: "ri", symbol: "り", romaji: "ri" },
  { id: "ru", symbol: "る", romaji: "ru" },
  { id: "re", symbol: "れ", romaji: "re" },
  { id: "ro", symbol: "ろ", romaji: "ro" },
  { id: "wa", symbol: "わ", romaji: "wa" },
  { id: "wo", symbol: "を", romaji: "wo" },
  { id: "n", symbol: "ん", romaji: "n" },
];

const katakana = [
  { id: "a", symbol: "ア", romaji: "a" },
  { id: "i", symbol: "イ", romaji: "i" },
  { id: "u", symbol: "ウ", romaji: "u" },
  { id: "e", symbol: "エ", romaji: "e" },
  { id: "o", symbol: "オ", romaji: "o" },
  { id: "ka", symbol: "カ", romaji: "ka" },
  { id: "ki", symbol: "キ", romaji: "ki" },
  { id: "ku", symbol: "ク", romaji: "ku" },
  { id: "ke", symbol: "ケ", romaji: "ke" },
  { id: "ko", symbol: "コ", romaji: "ko" },
  { id: "sa", symbol: "サ", romaji: "sa" },
  { id: "shi", symbol: "シ", romaji: "shi" },
  { id: "su", symbol: "ス", romaji: "su" },
  { id: "se", symbol: "セ", romaji: "se" },
  { id: "so", symbol: "ソ", romaji: "so" },
  { id: "ta", symbol: "タ", romaji: "ta" },
  { id: "chi", symbol: "チ", romaji: "chi" },
  { id: "tsu", symbol: "ツ", romaji: "tsu" },
  { id: "te", symbol: "テ", romaji: "te" },
  { id: "to", symbol: "ト", romaji: "to" },
  { id: "na", symbol: "ナ", romaji: "na" },
  { id: "ni", symbol: "ニ", romaji: "ni" },
  { id: "nu", symbol: "ヌ", romaji: "nu" },
  { id: "ne", symbol: "ネ", romaji: "ne" },
  { id: "no", symbol: "ノ", romaji: "no" },
  { id: "ha", symbol: "ハ", romaji: "ha" },
  { id: "hi", symbol: "ヒ", romaji: "hi" },
  { id: "fu", symbol: "フ", romaji: "fu" },
  { id: "he", symbol: "ヘ", romaji: "he" },
  { id: "ho", symbol: "ホ", romaji: "ho" },
  { id: "ma", symbol: "マ", romaji: "ma" },
  { id: "mi", symbol: "ミ", romaji: "mi" },
  { id: "mu", symbol: "ム", romaji: "mu" },
  { id: "me", symbol: "メ", romaji: "me" },
  { id: "mo", symbol: "モ", romaji: "mo" },
  { id: "ya", symbol: "ヤ", romaji: "ya" },
  { id: "yu", symbol: "ユ", romaji: "yu" },
  { id: "yo", symbol: "ヨ", romaji: "yo" },
  { id: "ra", symbol: "ラ", romaji: "ra" },
  { id: "ri", symbol: "リ", romaji: "ri" },
  { id: "ru", symbol: "ル", romaji: "ru" },
  { id: "re", symbol: "レ", romaji: "re" },
  { id: "ro", symbol: "ロ", romaji: "ro" },
  { id: "wa", symbol: "ワ", romaji: "wa" },
  { id: "wo", symbol: "ヲ", romaji: "wo" },
  { id: "n", symbol: "ン", romaji: "n" },
];

const AlphabetScreen = () => {
  const [isHiragana, setIsHiragana] = useState(true);
  const navigation = useNavigation();

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.symbol}>{item.symbol}</Text>
      <Text style={styles.romaji}>{item.romaji}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/flashcard.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng chữ cái</Text>
      </View>

      <View style={styles.container}>
        {/* Toggle Hiragana / Katakana */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, isHiragana && styles.activeBtn]}
            onPress={() => setIsHiragana(true)}
          >
            <Text style={[styles.toggleText, isHiragana && styles.activeText]}>
              Hiragana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isHiragana && styles.activeBtn]}
            onPress={() => setIsHiragana(false)}
          >
            <Text style={[styles.toggleText, !isHiragana && styles.activeText]}>
              Katakana
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alphabet Grid */}
        <FlatList
          data={isHiragana ? hiragana : katakana}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={5}
          contentContainerStyle={styles.list}
        />
      </View>
    </ImageBackground>
  );
};

export default AlphabetScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  activeBtn: {
    backgroundColor: "#007AFF",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  activeText: {
    color: "#fff",
  },
  list: {
    alignItems: "center",
    paddingBottom: 30,
  },
  card: {
    width: width / 5 - 10,
    margin: 5,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  symbol: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  romaji: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
