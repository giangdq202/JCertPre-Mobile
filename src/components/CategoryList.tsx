import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItem,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../styles/colors";

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface Props {
  data: Category[];
  onPressCategory: (item: Category) => void;
  itemSpacing?: number;
}

export default function CategoryList({
  data,
  onPressCategory,
  itemSpacing = 8,
}: Props) {
  const renderItem: ListRenderItem<Category> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { borderColor: item.color, marginHorizontal: itemSpacing / 2 },
      ]}
      activeOpacity={0.7}
      onPress={() => onPressCategory(item)}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={36}
        color={item.color}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: item.color }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 5,
  },
  item: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  icon: {
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
