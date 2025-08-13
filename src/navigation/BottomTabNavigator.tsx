import React from "react";
import { View, Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import CourseScreen from "../screens/course/CourseScreen";
import TestScreen from "../screens/test/TestScreen";
import ScheduleScreen from "../screens/schedule/ScheduleScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

// Types
type BottomTabParamList = {
  Home: undefined;
  Course: undefined;
  Test: undefined;
  Schedule: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ===== Styles =====
const tabBarStyle = {
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderTopColor: "#e5e7eb",
  height: 75,
  paddingVertical: 10,
  elevation: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -3 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
};

const tabBarLabelStyle = {
  fontSize: 12,
  fontWeight: "600" as const,
};

// ===== Helpers =====
const getTabIcon = (routeName: string, focused: boolean) => {
  let iconName = "";
  let IconComponent: any = Ionicons;

  switch (routeName) {
    case "Home":
      iconName = focused ? "home" : "home-outline";
      break;
    case "Course":
      iconName = focused ? "book" : "book-outline";
      break;
    case "Test":
      IconComponent = MaterialCommunityIcons;
      iconName = focused ? "file-document-edit" : "file-document-edit-outline";
      break;
    case "Schedule":
      iconName = focused ? "calendar" : "calendar-outline";
      break;
    case "Profile":
      iconName = focused ? "person" : "person-outline";
      break;
    default:
      iconName = "ellipse-outline";
  }

  const scale = new Animated.Value(focused ? 1.2 : 1);
  Animated.spring(scale, {
    toValue: focused ? 1.2 : 1,
    useNativeDriver: true,
  }).start();

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <IconComponent
          name={iconName}
          size={22}
          color={focused ? "#22c55e" : "#9ca3af"}
        />
      </Animated.View>
    </View>
  );
};

// ===== Navigator =====
const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarLabelStyle,
      tabBarActiveTintColor: "#22c55e",
      tabBarInactiveTintColor: "#9ca3af",
      tabBarIcon: ({ focused }) => getTabIcon(route.name, focused),
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarLabel: "Trang chủ" }}
    />
    <Tab.Screen
      name="Course"
      component={CourseScreen}
      options={{ tabBarLabel: "Khoá học" }}
    />
    <Tab.Screen
      name="Test"
      component={TestScreen}
      options={{ tabBarLabel: "Thi thử" }}
    />
    <Tab.Screen
      name="Schedule"
      component={ScheduleScreen}
      options={{ tabBarLabel: "Lịch học" }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarLabel: "Cá nhân" }}
    />
  </Tab.Navigator>
);

export default BottomTabNavigator;
