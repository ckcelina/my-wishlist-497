import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
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

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    if (!isAuthenticated && !inAuthGroup) {
      console.log("Not authenticated, redirecting to login");
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      console.log("Authenticated, redirecting to home");
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  if (!isInitialized || isLoading) {
    return (
      <View style={[authStyles.loadingContainer, { backgroundColor: colors.background }]}>
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
      <GestureHandlerRootView>
        <ErrorBoundary>
          <AuthProvider>
            <WishlistProvider>
              <RootLayoutNav />
            </WishlistProvider>
          </AuthProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const authStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
