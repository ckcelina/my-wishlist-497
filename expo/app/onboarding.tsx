import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ArrowRight, X } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ONBOARDING_KEY = "has_onboarded_v1";

const SLIDES = [
  {
    id: 1,
    emoji: "🛍️",
    title: "Your Global\nShopping List",
    subtitle:
      "Save products from any store worldwide and organize them in beautiful wishlists.",
    bg: "#1a0a2e",
    accent: "#4c2090",
  },
  {
    id: 2,
    emoji: "🔍",
    title: "Search\nWorldwide",
    subtitle:
      "Find products in your country and compare prices across 190+ countries instantly.",
    bg: "#110b1d",
    accent: "#8032ee",
  },
  {
    id: 3,
    emoji: "📉",
    title: "Never Miss\na Price Drop",
    subtitle:
      "Set price alerts and get notified the moment your saved products go on sale.",
    bg: "#0d0818",
    accent: "#4c2090",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleComplete = useCallback(async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/");
  }, [router]);

  const animateTransition = useCallback(
    (toIndex: number) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.92,
            duration: 180,
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
      ]).start();
      setCurrentSlide(toIndex);
    },
    [fadeAnim, scaleAnim]
  );

  const handleNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      animateTransition(currentSlide + 1);
    } else {
      void handleComplete();
    }
  }, [currentSlide, animateTransition, handleComplete]);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      <View style={[styles.accentBg, { backgroundColor: slide.accent }]} />

      <Pressable
        onPress={() => void handleComplete()}
        style={[styles.skipBtn, { paddingTop: insets.top + 16 }]}
        testID="onboarding-skip"
      >
        <X size={20} color="rgba(255,255,255,0.6)" />
      </Pressable>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => animateTransition(i)}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: i === currentSlide ? 28 : 8,
                    backgroundColor:
                      i === currentSlide
                        ? "#FFFFFF"
                        : "rgba(255,255,255,0.35)",
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={styles.ctaButton}
          testID="onboarding-next"
        >
          <Text style={[styles.ctaText, { color: slide.bg }]}>
            {isLast ? "Get Started" : "Continue"}
          </Text>
          <ArrowRight size={20} color={slide.bg} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accentBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    opacity: 0.5,
  },
  skipBtn: {
    position: "absolute",
    top: 0,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 28,
    paddingTop: 60,
  },
  emojiContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  emoji: {
    fontSize: 78,
  },
  title: {
    fontSize: 40,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    textAlign: "center" as const,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center" as const,
    lineHeight: 26,
    maxWidth: SCREEN_WIDTH - 80,
  },
  bottom: {
    paddingHorizontal: 24,
    gap: 24,
  },
  dots: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 8,
    alignItems: "center" as const,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
});
