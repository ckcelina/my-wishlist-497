import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { SearchHistoryProvider } from "@/providers/SearchHistoryProvider";
import { PriceAlertProvider } from "@/providers/PriceAlertProvider";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import ErrorBoundary from "@/components/ErrorBoundary";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colors = useAppColors();
  const hasRedirected = useRef(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("has_onboarded_v1").then((val) => {
      setHasOnboarded(val === "true");
    }).catch(() => setHasOnboarded(true));
  }, [segments]);

  useEffect(() => {
    if (!isInitialized || hasOnboarded === null) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";
    const inOnboarding = segments[0] === "onboarding";

    if (!isAuthenticated && !inAuthGroup) {
      console.log("[AuthGate] Not authenticated, redirecting to login");
      hasRedirected.current = true;
      setTimeout(() => router.replace("/login"), 0);
    } else if (isAuthenticated && inAuthGroup) {
      console.log("[AuthGate] Authenticated, redirecting to home");
      hasRedirected.current = true;
      setTimeout(() => router.replace("/"), 0);
    } else if (isAuthenticated && !hasOnboarded && !inOnboarding) {
      console.log("[AuthGate] First time user, showing onboarding");
      hasRedirected.current = true;
      setTimeout(() => router.replace("/onboarding"), 0);
    } else {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, isInitialized, segments, router, hasOnboarded]);

  if (!isInitialized || isLoading || hasOnboarded === null) {
    return (
      <View style={[authStyles.loadingOverlay, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthGate />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="wishlist-detail"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="product-detail"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="wishlist-chat"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="create-list"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="price-alerts"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={authStyles.flex}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <LocationProvider>
                <SearchHistoryProvider>
                  <PriceAlertProvider>
                    <WishlistProvider>
                      <RootLayoutNav />
                    </WishlistProvider>
                  </PriceAlertProvider>
                </SearchHistoryProvider>
              </LocationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const authStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
