import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/ui/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useTheme } from "@/hooks/useTheme";
export default function TabLayout() {
  const colors = useTheme();
  return <Tabs screenOptions={{
    tabBarActiveTintColor: colors.tabIconSelected,
    tabBarInactiveTintColor: colors.tabIconDefault,
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    tabBarStyle: Platform.select({
      ios: {
        position: "absolute"
      },
      default: {}
    })
  }}>
      <Tabs.Screen name="index" options={{
      title: "Tasks",
      tabBarIcon: ({
        color
      }) => <IconSymbol size={28} name="checklist" color={color} />
    }} />
      {}

      <Tabs.Screen name="completed" options={{
      title: "Completed",
      tabBarIcon: ({
        color
      }) => <IconSymbol size={28} name="checkmark.seal.fill" color={color} />
    }} />
      <Tabs.Screen name="search" options={{
      title: "Search",
      tabBarIcon: ({
        color
      }) => <IconSymbol size={28} name="magnifyingglass" color={color} />
    }} />
    </Tabs>;
}