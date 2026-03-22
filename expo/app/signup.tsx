import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock, UserRound, Globe, Search, X, Check, ChevronRight } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useAuth } from "@/providers/AuthProvider";
import { useLocation } from "@/providers/LocationProvider";
import { CountryData } from "@/constants/countries";

export default function SignUpScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp, isSigningUp } = useAuth();
  const { allCountries, setCountry } = useLocation();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [countrySearch, setCountrySearch] = useState<string>("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    country?: string;
  }>({});

  const buttonScale = useRef(new Animated.Value(1)).current;
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return allCountries;
    const q = countrySearch.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch, allCountries]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!selectedCountry) {
      newErrors.country = "Please select your country";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    try {
      const result = await signUp({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
      });
      console.log("[SignUp] Sign up successful, session:", result.session ? "exists" : "none");

      if (selectedCountry) {
        console.log("[SignUp] Saving country:", selectedCountry.name);
        await setCountry(selectedCountry.code);
      }

      if (result.session) {
        console.log("[SignUp] Auto-signed in, AuthGate will redirect");
      } else {
        Alert.alert(
          "Check Your Email",
          "We sent a confirmation link to your email. Please verify your account, then sign in.",
          [{ text: "Go to Sign In", onPress: () => router.replace("/login") }]
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed. Please try again.";
      console.log("[SignUp] Error:", message);
      Alert.alert("Sign Up Failed", message);
    }
  };

  const handleSelectCountry = useCallback((c: CountryData) => {
    setSelectedCountry(c);
    setShowCountryPicker(false);
    setCountrySearch("");
    if (errors.country) setErrors((p) => ({ ...p, country: undefined }));
  }, [errors.country]);

  const renderCountryItem = useCallback(({ item }: { item: CountryData }) => {
    const isSelected = selectedCountry?.code === item.code;
    return (
      <Pressable
        onPress={() => handleSelectCountry(item)}
        style={[
          styles.countryItem,
          { borderBottomColor: colors.borderLight },
          isSelected && { backgroundColor: colors.primaryFaded },
        ]}
      >
        <View style={styles.countryItemLeft}>
          <Text style={styles.countryFlag}>{item.flag}</Text>
          <View style={styles.countryItemInfo}>
            <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.countryCurrency, { color: colors.textTertiary }]}>
              {item.currency}
            </Text>
          </View>
        </View>
        {isSelected && <Check size={18} color={colors.primary} />}
      </Pressable>
    );
  }, [selectedCountry, colors, handleSelectCountry]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryFaded }]}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join My Wishlist to start saving and sharing
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.fullName ? colors.error : colors.border,
                  },
                ]}
              >
                <UserRound size={18} color={colors.textTertiary} />
                <TextInput
                  testID="signup-name-input"
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Your full name"
                  placeholderTextColor={colors.textTertiary}
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined }));
                  }}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
              {errors.fullName && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.fullName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.email ? colors.error : colors.border,
                  },
                ]}
              >
                <Mail size={18} color={colors.textTertiary} />
                <TextInput
                  ref={emailRef}
                  testID="signup-email-input"
                  style={[styles.input, { color: colors.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.password ? colors.error : colors.border,
                  },
                ]}
              >
                <Lock size={18} color={colors.textTertiary} />
                <TextInput
                  ref={passwordRef}
                  testID="signup-password-input"
                  style={[styles.input, { color: colors.text }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textTertiary} />
                  ) : (
                    <Eye size={18} color={colors.textTertiary} />
                  )}
                </Pressable>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Confirm Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.confirmPassword ? colors.error : colors.border,
                  },
                ]}
              >
                <Lock size={18} color={colors.textTertiary} />
                <TextInput
                  ref={confirmRef}
                  testID="signup-confirm-input"
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                  secureTextEntry={!showConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
                  {showConfirm ? (
                    <EyeOff size={18} color={colors.textTertiary} />
                  ) : (
                    <Eye size={18} color={colors.textTertiary} />
                  )}
                </Pressable>
              </View>
              {errors.confirmPassword && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Your Country
              </Text>
              <Pressable
                testID="signup-country-picker"
                onPress={() => {
                  setCountrySearch("");
                  setShowCountryPicker(true);
                }}
                style={[
                  styles.countryPickerBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.country ? colors.error : colors.border,
                  },
                ]}
              >
                <Globe size={18} color={colors.textTertiary} />
                {selectedCountry ? (
                  <View style={styles.selectedCountryRow}>
                    <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
                    <Text style={[styles.selectedCountryName, { color: colors.text }]}>
                      {selectedCountry.name}
                    </Text>
                    <Text style={[styles.selectedCurrencyCode, { color: colors.textTertiary }]}>
                      {selectedCountry.currency}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.countryPlaceholder, { color: colors.textTertiary }]}>
                    Select your country
                  </Text>
                )}
                <ChevronRight size={16} color={colors.textTertiary} />
              </Pressable>
              {errors.country && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.country}</Text>
              )}
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable
                testID="signup-button"
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: isSigningUp ? 0.7 : 1 },
                ]}
                onPress={handleSignUp}
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </Pressable>
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Pressable
              testID="go-to-login"
              style={[
                styles.secondaryButton,
                { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
              ]}
              onPress={() => router.replace("/login")}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Already have an account? Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)} hitSlop={8}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Search size={16} color={colors.textTertiary} />
              <TextInput
                placeholder="Search countries..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.searchInput, { color: colors.text }]}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
              {countrySearch.length > 0 && (
                <Pressable onPress={() => setCountrySearch("")} hitSlop={8}>
                  <X size={16} color={colors.textTertiary} />
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center" as const,
  },
  formSection: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%" as const,
  },
  countryPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  selectedCountryRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedFlag: {
    fontSize: 20,
  },
  selectedCountryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
  },
  selectedCurrencyCode: {
    fontSize: 13,
  },
  countryPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
    marginTop: 2,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  footer: {
    marginTop: 28,
    gap: 20,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 40,
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
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  modalList: {
    paddingHorizontal: 12,
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 2,
  },
  countryItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  countryFlag: {
    fontSize: 26,
  },
  countryItemInfo: {
    flex: 1,
    gap: 2,
  },
  countryName: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  countryCurrency: {
    fontSize: 12,
  },
});
