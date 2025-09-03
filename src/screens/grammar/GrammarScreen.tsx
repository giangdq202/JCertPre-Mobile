import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  StatusBar,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import backgroundImage from "../../assets/flashcard.jpg";

type RootStackParamList = {
  Home: undefined;
  Grammar: undefined;
  GrammarDetail: { groupId: string; title: string };
};

type GrammarScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "Grammar"
>;

const grammarGroups = [
  { id: "n5", title: "Ngữ pháp N5", icon: "file-document", color: "#A8D5BA" },
  {
    id: "n4",
    title: "Ngữ pháp N4",
    icon: "file-document-outline",
    color: "#81D4FA",
  },
  {
    id: "n3",
    title: "Ngữ pháp N3",
    icon: "file-document-edit",
    color: "#B39DDB",
  },
  {
    id: "n2",
    title: "Ngữ pháp N2",
    icon: "file-document-multiple",
    color: "#FF8A65",
  },
  {
    id: "n1",
    title: "Ngữ pháp N1",
    icon: "file-document-multiple",
    color: "#7E57C2",
  },
];

const GrammarItem = ({
  item,
  onPress,
}: {
  item: (typeof grammarGroups)[0];
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
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
      onPress={onPress}
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
          <Text style={styles.subtitle}>Xem chi tiết</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={28} color="#bbb" />
      </Animated.View>
    </Pressable>
  );
};

const GrammarScreen = () => {
  const navigation = useNavigation<GrammarScreenProp>();

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#f9f9f9"
            />
          </Pressable>
          <Text style={styles.headerTitle}>Ngữ pháp</Text>
        </View>

        <FlatList
          data={grammarGroups}
          renderItem={({ item }) => (
            <GrammarItem
              item={item}
              onPress={() =>
                navigation.navigate("GrammarDetail", {
                  groupId: item.id,
                  title: item.title,
                })
              }
            />
          )}
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
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
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

export default GrammarScreen;
