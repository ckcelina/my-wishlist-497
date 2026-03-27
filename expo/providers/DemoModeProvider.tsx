import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

const DEMO_MODE_KEY = "app_demo_mode_v1";

export const [DemoModeProvider, useDemoMode] = createContextHook(() => {
  const [isDemoMode, setIsDemoModeState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DEMO_MODE_KEY)
      .then((val) => {
        if (val === "true") {
          setIsDemoModeState(true);
        }
        console.log("[DemoMode] Loaded:", val === "true");
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const setDemoMode = useCallback(async (enabled: boolean) => {
    setIsDemoModeState(enabled);
    await AsyncStorage.setItem(DEMO_MODE_KEY, enabled ? "true" : "false");
    console.log("[DemoMode] Set to:", enabled);
  }, []);

  const toggleDemoMode = useCallback(async () => {
    const next = !isDemoMode;
    setIsDemoModeState(next);
    await AsyncStorage.setItem(DEMO_MODE_KEY, next ? "true" : "false");
    console.log("[DemoMode] Toggled to:", next);
  }, [isDemoMode]);

  return useMemo(
    () => ({
      isDemoMode,
      isLoaded,
      setDemoMode,
      toggleDemoMode,
    }),
    [isDemoMode, isLoaded, setDemoMode, toggleDemoMode]
  );
});
