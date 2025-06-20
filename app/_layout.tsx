import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // 1. IMPORT THE WRAPPER
import "react-native-reanimated";

import { TodosProvider } from "@/hooks/TodosContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // 2. WRAP THE ENTIRE APP WITH THE GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TodosProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TodosProvider>
    </GestureHandlerRootView>
  );
}
