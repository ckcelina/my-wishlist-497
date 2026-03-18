import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Settings,
  Globe,
  DollarSign,
  Shield,
  ChevronRight,
  LogOut,
  Heart,
  Share2,
  Gift,
  X,
  Check,
  Database,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
} from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { useAuth } from "@/providers/AuthProvider";
import { checkDatabaseHealth, DbHealthResult } from "@/lib/api";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Japan", "South Korea", "India", "Brazil",
  "Mexico", "Saudi Arabia", "UAE", "Singapore", "Nigeria",
];

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "KRW", name: "Korean Won", symbol: "₩" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
];

export default function ProfileScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { user, wishlists, sharedLists, allProducts } = useWishlistContext();
  const { profile, signOut, isSigningOut, updateProfile, isUpdatingProfile } = useAuth();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [editName, setEditName] = useState("");
  const [dbHealth, setDbHealth] = useState<DbHealthResult | null>(null);

  const dbHealthMutation = useMutation({
    mutationFn: async () => {
      return checkDatabaseHealth();
    },
    onSuccess: (data) => {
      setDbHealth(data);
      if (data.status === "ok") {
        Alert.alert("Database Status", "All tables are set up correctly!");
      } else {
        const missing = Object.entries(data.tables)
          .filter(([, t]) => !t.exists)
          .map(([name]) => name);
        Alert.alert(
          "Missing Tables",
          `The following tables need to be created in Supabase:\n\n${missing.join(", ")}\n\nRun the SQL migration in your Supabase dashboard SQL editor.`
        );
      }
    },
    onError: (err) => {
      console.log("[Profile] DB health check error:", err);
      Alert.alert("Error", "Failed to check database status.");
    },
  });

  const displayName = profile?.full_name || user.name;
  const displayEmail = profile?.email || user.email;
  const displayCountry = profile?.country || user.country;
  const displayCurrency = profile?.currency || user.currency;

  const handleUpdateCountry = async (country: string) => {
    setShowCountryPicker(false);
    try {
      await updateProfile({ country });
      console.log("[Profile] Country updated to:", country);
    } catch (err) {
      console.log("[Profile] Failed to update country:", err);
      Alert.alert("Error", "Failed to update country.");
    }
  };

  const handleUpdateCurrency = async (currency: string) => {
    setShowCurrencyPicker(false);
    try {
      await updateProfile({ currency });
      console.log("[Profile] Currency updated to:", currency);
    } catch (err) {
      console.log("[Profile] Failed to update currency:", err);
      Alert.alert("Error", "Failed to update currency.");
    }
  };

  const handleUpdateName = async () => {
    if (!editName.trim()) return;
    setShowNameEditor(false);
    try {
      await updateProfile({ full_name: editName.trim() });
      console.log("[Profile] Name updated to:", editName.trim());
    } catch (err) {
      console.log("[Profile] Failed to update name:", err);
      Alert.alert("Error", "Failed to update name.");
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isSigningOut ? "Signing Out..." : "Sign Out",
          style: "destructive",
          onPress: () => {
            signOut().catch((err: unknown) => {
              console.log("Sign out error:", err);
            });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.profileHeader, { paddingTop: insets.top + 20, backgroundColor: colors.surface }]}>
          <Image
            source={profile?.avatar_url ? { uri: profile.avatar_url } : require("@/assets/images/icon.png")}
            style={[styles.avatar, { borderColor: colors.primary }]}
          />
          <Pressable
            onPress={() => {
              setEditName(displayName);
              setShowNameEditor(true);
            }}
          >
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
          </Pressable>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{displayEmail}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primaryFaded }]}>
                <Gift size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{wishlists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lists</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primaryFaded }]}>
                <Heart size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{allProducts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primaryFaded }]}>
                <Share2 size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{sharedLists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Shared</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PREFERENCES</Text>
          <View style={[styles.sectionCards, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => setShowCountryPicker(true)}
            >
              <View style={styles.settingLeft}>
                <Globe size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Country</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>{displayCountry}</Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
            <Pressable
              style={styles.settingRow}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <View style={styles.settingLeft}>
                <DollarSign size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Currency</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>{displayCurrency}</Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ACCOUNT</Text>
          <View style={[styles.sectionCards, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => Alert.alert("Privacy", "Privacy settings coming soon.")}
            >
              <View style={styles.settingLeft}>
                <Shield size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy</Text>
              </View>
              <View style={styles.settingRight}>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => Alert.alert("Settings", "App settings coming soon.")}
            >
              <View style={styles.settingLeft}>
                <Settings size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Settings</Text>
              </View>
              <View style={styles.settingRight}>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => dbHealthMutation.mutate()}
              disabled={dbHealthMutation.isPending}
            >
              <View style={styles.settingLeft}>
                <Database size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Database Status</Text>
              </View>
              <View style={styles.settingRight}>
                {dbHealthMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : dbHealth ? (
                  dbHealth.status === "ok" ? (
                    <CheckCircle2 size={18} color={colors.success} />
                  ) : (
                    <AlertCircle size={18} color={colors.warning} />
                  )
                ) : (
                  <ChevronRight size={18} color={colors.textTertiary} />
                )}
              </View>
            </Pressable>
            <Pressable
              style={styles.settingRow}
              onPress={handleSignOut}
            >
              <View style={styles.settingLeft}>
                <LogOut size={20} color={colors.error} />
                <Text style={[styles.settingLabel, { color: colors.error }]}>Sign Out</Text>
              </View>
              <View style={styles.settingRight}>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalList}>
              {COUNTRIES.map((country) => (
                <Pressable
                  key={country}
                  onPress={() => void handleUpdateCountry(country)}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.borderLight },
                    displayCountry === country && { backgroundColor: colors.primaryFaded },
                  ]}
                >
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>{country}</Text>
                  {displayCountry === country && <Check size={18} color={colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showCurrencyPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
              <Pressable onPress={() => setShowCurrencyPicker(false)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalList}>
              {CURRENCIES.map((curr) => (
                <Pressable
                  key={curr.code}
                  onPress={() => void handleUpdateCurrency(curr.code)}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.borderLight },
                    displayCurrency === curr.code && { backgroundColor: colors.primaryFaded },
                  ]}
                >
                  <View style={styles.currencyRow}>
                    <Text style={[styles.currencySymbol, { color: colors.primary }]}>{curr.symbol}</Text>
                    <View>
                      <Text style={[styles.modalOptionText, { color: colors.text }]}>{curr.code}</Text>
                      <Text style={[styles.currencyName, { color: colors.textSecondary }]}>{curr.name}</Text>
                    </View>
                  </View>
                  {displayCurrency === curr.code && <Check size={18} color={colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showNameEditor} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.nameEditorContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 16 }]}>Edit Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.nameInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={styles.nameEditorActions}>
              <Pressable
                onPress={() => setShowNameEditor(false)}
                style={[styles.nameBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.nameBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleUpdateName()}
                style={[styles.nameBtn, { backgroundColor: colors.primary }]}
                disabled={isUpdatingProfile}
              >
                <Text style={[styles.nameBtnText, { color: "#FFFFFF" }]}>
                  {isUpdatingProfile ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
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
  profileHeader: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    marginBottom: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statItem: {
    alignItems: "center",
    gap: 6,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800" as const,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 50,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCards: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 2,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "700" as const,
    width: 30,
    textAlign: "center" as const,
  },
  currencyName: {
    fontSize: 13,
    marginTop: 1,
  },
  nameEditorContent: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    marginTop: "auto",
    marginBottom: "auto",
  },
  nameInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
  },
  nameEditorActions: {
    flexDirection: "row",
    gap: 12,
  },
  nameBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  nameBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
