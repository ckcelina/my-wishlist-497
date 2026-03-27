import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ArrowRight, X, Search, Check, Globe } from "lucide-react-native";
import { useLocation } from "@/providers/LocationProvider";
import { CountryData } from "@/constants/countries";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ONBOARDING_KEY = "has_onboarded_v1";

const INFO_SLIDES = [
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

const TOTAL_STEPS = INFO_SLIDES.length + 1;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { allCountries, setCountry } = useLocation();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return allCountries;
    const q = countrySearch.toLowerCase();
    return allCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch, allCountries]);

  const handleComplete = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (selectedCountry) {
      console.log("[Onboarding] Saving country:", selectedCountry.name);
      await setCountry(selectedCountry.code);
    }
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/");
  }, [router, selectedCountry, setCountry, isSaving]);

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
      setCurrentStep(toIndex);
    },
    [fadeAnim, scaleAnim]
  );

  const handleNext = useCallback(() => {
    if (currentStep < INFO_SLIDES.length - 1) {
      animateTransition(currentStep + 1);
    } else if (currentStep === INFO_SLIDES.length - 1) {
      animateTransition(INFO_SLIDES.length);
    } else {
      void handleComplete();
    }
  }, [currentStep, animateTransition, handleComplete]);

  const isCountryStep = currentStep === INFO_SLIDES.length;
  const slide = !isCountryStep ? INFO_SLIDES[currentStep] : null;
  const bg = slide?.bg ?? "#0d0818";
  const accent = slide?.accent ?? "#4c2090";

  const renderCountryItem = useCallback(
    ({ item }: { item: CountryData }) => {
      const isSelected = selectedCountry?.code === item.code;
      return (
        <Pressable
          onPress={() => {
            setSelectedCountry(item);
            setShowCountryPicker(false);
            setCountrySearch("");
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[
            styles.countryItem,
            isSelected && styles.countryItemSelected,
          ]}
        >
          <Text style={styles.countryFlag}>{item.flag}</Text>
          <View style={styles.countryItemInfo}>
            <Text style={styles.countryItemName}>{item.name}</Text>
            <Text style={styles.countryItemCurrency}>{item.currency}</Text>
          </View>
          {isSelected && <Check size={18} color="#FFFFFF" />}
        </Pressable>
      );
    },
    [selectedCountry]
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.accentBg, { backgroundColor: accent }]} />

      {!isCountryStep && (
        <Pressable
          onPress={() => void handleComplete()}
          style={[styles.skipBtn, { paddingTop: insets.top + 16 }]}
          testID="onboarding-skip"
        >
          <X size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>
      )}

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isCountryStep ? (
          <View style={styles.countryStepContent}>
            <Text style={styles.countryStepEmoji}>🌍</Text>
            <Text style={styles.countryStepTitle}>Where are you{"\n"}shopping from?</Text>
            <Text style={styles.countryStepSubtitle}>
              We'll show you stores, prices, and deals that ship to you.
            </Text>

            <Pressable
              onPress={() => {
                setCountrySearch("");
                setShowCountryPicker(true);
              }}
              style={[
                styles.countrySelector,
                selectedCountry ? styles.countrySelectorSelected : styles.countrySelectorEmpty,
              ]}
            >
              <Globe
                size={20}
                color={selectedCountry ? "#FFFFFF" : "rgba(255,255,255,0.5)"}
              />
              {selectedCountry ? (
                <View style={styles.selectedRow}>
                  <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.selectedName}>{selectedCountry.name}</Text>
                  <Text style={styles.selectedCurrency}>{selectedCountry.currency}</Text>
                </View>
              ) : (
                <Text style={styles.countrySelectorPlaceholder}>
                  Tap to select your country
                </Text>
              )}
              <ArrowRight
                size={16}
                color={selectedCountry ? "#FFFFFF" : "rgba(255,255,255,0.5)"}
              />
            </Pressable>

            {!selectedCountry && (
              <Text style={styles.skipHint}>
                You can change this anytime in settings
              </Text>
            )}
          </View>
        ) : (
          slide !== null && (
            <>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </>
          )
        )}
      </Animated.View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                if (i < currentStep || (i === currentStep + 1)) {
                  animateTransition(i);
                }
              }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    width: i === currentStep ? 28 : 8,
                    backgroundColor:
                      i === currentStep
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
          style={[
            styles.ctaButton,
            isCountryStep && !selectedCountry && styles.ctaButtonSecondary,
          ]}
          testID="onboarding-next"
          disabled={isSaving}
        >
          <Text style={[styles.ctaText, { color: bg }]}>
            {isCountryStep
              ? selectedCountry
                ? "Start Shopping"
                : "Skip for now"
              : currentStep === INFO_SLIDES.length - 1
              ? "Choose My Country"
              : "Continue"}
          </Text>
          <ArrowRight size={20} color={bg} />
        </Pressable>
      </View>

      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable
                onPress={() => setShowCountryPicker(false)}
                hitSlop={8}
              >
                <X size={22} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.searchBar}>
              <Search size={16} color="rgba(255,255,255,0.5)" />
              <TextInput
                placeholder="Search countries..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.searchInput}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
              {countrySearch.length > 0 && (
                <Pressable onPress={() => setCountrySearch("")} hitSlop={8}>
                  <X size={16} color="rgba(255,255,255,0.5)" />
                </Pressable>
              )}
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
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
  countryStepContent: {
    alignItems: "center",
    width: "100%",
    gap: 20,
  },
  countryStepEmoji: {
    fontSize: 80,
    marginBottom: 4,
  },
  countryStepTitle: {
    fontSize: 38,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    textAlign: "center" as const,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  countryStepSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center" as const,
    lineHeight: 24,
    maxWidth: SCREEN_WIDTH - 80,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    gap: 12,
    marginTop: 8,
  },
  countrySelectorEmpty: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  countrySelectorSelected: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
  },
  selectedRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedFlag: {
    fontSize: 22,
  },
  selectedName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  selectedCurrency: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  countrySelectorPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
  },
  skipHint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center" as const,
    marginTop: 4,
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
  ctaButtonSecondary: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a0a2e",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    color: "#FFFFFF",
  },
  modalList: {
    paddingHorizontal: 12,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: "rgba(128, 50, 238, 0.35)",
  },
  countryFlag: {
    fontSize: 26,
  },
  countryItemInfo: {
    flex: 1,
    gap: 2,
  },
  countryItemName: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  countryItemCurrency: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});
