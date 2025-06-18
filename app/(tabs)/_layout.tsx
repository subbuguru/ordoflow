// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/hooks/useTheme'; // Import the new hook

export default function TabLayout() {
  const colors = useTheme(); // Use the hook to get current theme colors

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected, // Use theme color
        tabBarInactiveTintColor: colors.tabIconDefault, // Use theme color for inactive tabs
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: 'Completed',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.seal.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}