import { useState, useEffect, useMemo, useCallback } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import Colors from "@/constants/colors";

export type ThemeMode = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "theme_preference";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setThemeModeState(stored);
          console.log("[Theme] Loaded preference:", stored);
        }
      } catch (err) {
        console.log("[Theme] Error loading preference:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    void loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      console.log("[Theme] Saved preference:", mode);
    } catch (err) {
      console.log("[Theme] Error saving preference:", err);
    }
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? Colors.dark : Colors.light;
  }, [isDark]);

  return useMemo(
    () => ({
      themeMode,
      setThemeMode,
      isDark,
      colors,
      isLoaded,
    }),
    [themeMode, setThemeMode, isDark, colors, isLoaded]
  );
});
