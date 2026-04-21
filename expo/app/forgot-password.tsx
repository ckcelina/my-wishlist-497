import React, { useState, useRef } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useAuth } from "@/providers/AuthProvider";

export default function ForgotPasswordScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetPassword, isResettingPassword } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState<boolean>(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email");
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: Platform.OS !== "web" }),
    ]).start();

    try {
      await resetPassword({ email: email.trim().toLowerCase() });
      setSent(true);
      console.log("[ForgotPassword] Reset email sent");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not send reset email. Please try again.";
      console.log("[ForgotPassword] Error:", message);
      Alert.alert("Reset Failed", message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            testID="forgot-back"
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>

          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryFaded }]}>
              {sent ? (
                <CheckCircle2 size={32} color={colors.primary} />
              ) : (
                <Mail size={32} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {sent ? "Check your email" : "Forgot password?"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {sent
                ? `We sent a password reset link to ${email.trim().toLowerCase()}. Follow the link to set a new password.`
                : "Enter your email address and we'll send you a link to reset your password."}
            </Text>
          </View>

          {!sent ? (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.surface,
                      borderColor: emailError ? colors.error : colors.border,
                    },
                  ]}
                >
                  <Mail size={18} color={colors.textTertiary} />
                  <TextInput
                    testID="forgot-email-input"
                    style={[styles.input, { color: colors.text }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (emailError) setEmailError(undefined);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit}
                  />
                </View>
                {emailError ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text>
                ) : null}
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  testID="forgot-submit"
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.primary, opacity: isResettingPassword ? 0.7 : 1 },
                  ]}
                  onPress={handleSubmit}
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                  )}
                </Pressable>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.formSection}>
              <Pressable
                testID="forgot-resend"
                style={[styles.secondaryButton, { borderColor: colors.primary, backgroundColor: colors.primaryFaded }]}
                onPress={() => {
                  setSent(false);
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Send to another email
                </Text>
              </Pressable>

              <Pressable
                testID="forgot-back-to-login"
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.primaryButtonText}>Back to Sign In</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
    marginTop: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  formSection: {
    gap: 20,
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
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
});
