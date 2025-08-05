import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/home/HomeScreen";
import CourseScreen from "../screens/course/CourseScreen";
import TestScreen from "../screens/test/TestScreen";
import ScheduleScreen from "../screens/schedule/ScheduleScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

type BottomTabParamList = {
  Home: undefined;
  Course: undefined;
  Test: undefined;
  Schedule: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 75,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#9ca3af",

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          let IconComponent: any = Ionicons;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Course":
              iconName = focused ? "book" : "book-outline";
              break;
            case "Test":
              IconComponent = MaterialCommunityIcons;
              iconName = focused
                ? "file-document-edit"
                : "file-document-edit-outline";
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
                <IconComponent name={iconName} size={size} color={color} />
              </Animated.View>
            </View>
          );
        },
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
};

export default BottomTabNavigator;
