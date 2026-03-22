import React, { useState, useCallback, useMemo } from "react";
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
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
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
  Sun,
  Moon,
  Monitor,
  Palette,
  MapPin,
  Search,
  Store,
  ArrowLeftRight,
} from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme, ThemeMode } from "@/providers/ThemeProvider";
import { useLocation } from "@/providers/LocationProvider";
import { checkDatabaseHealth, DbHealthResult } from "@/lib/api";
import { CountryData, CurrencyData } from "@/constants/countries";

export default function ProfileScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { user, wishlists, sharedLists, allProducts } = useWishlistContext();
  const { profile, signOut, isSigningOut, updateProfile, isUpdatingProfile } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const {
    country, city, currency, countryCode, currencyCode,
    availableStores, availableCities,
    setCountry, setCity, setCurrency,
    allCountries, allCurrencies,
  } = useLocation();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [editName, setEditName] = useState("");
  const [dbHealth, setDbHealth] = useState<DbHealthResult | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");

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
          `The following tables need to be created:\n\n${missing.join(", ")}`
        );
      }
    },
    onError: () => {
      Alert.alert("Error", "Failed to check database status.");
    },
  });

  const displayName = profile?.full_name || user.name;
  const displayEmail = profile?.email || user.email;

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return allCountries;
    const q = countrySearch.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.cities.some((city) => city.toLowerCase().includes(q))
    );
  }, [countrySearch, allCountries]);

  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return allCurrencies;
    const q = currencySearch.toLowerCase();
    return allCurrencies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [currencySearch, allCurrencies]);

  const handleSelectCountry = useCallback(
    (c: CountryData) => {
      setShowCountryPicker(false);
      setCountrySearch("");
      void setCountry(c.code);
    },
    [setCountry]
  );

  const handleSelectCurrency = useCallback(
    (c: CurrencyData) => {
      setShowCurrencyPicker(false);
      setCurrencySearch("");
      void setCurrency(c.code);
    },
    [setCurrency]
  );

  const handleSelectCity = useCallback(
    (selectedCity: string) => {
      setShowCityPicker(false);
      void setCity(selectedCity);
    },
    [setCity]
  );

  const handleUpdateName = async () => {
    if (!editName.trim()) return;
    setShowNameEditor(false);
    try {
      await updateProfile({ full_name: editName.trim() });
    } catch {
      Alert.alert("Error", "Failed to update name.");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: isSigningOut ? "Signing Out..." : "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut().catch(() => {});
        },
      },
    ]);
  };

  const renderCountryItem = useCallback(
    ({ item }: { item: CountryData }) => {
      const isSelected = item.code === countryCode;
      return (
        <Pressable
          onPress={() => handleSelectCountry(item)}
          style={[
            styles.pickerItem,
            { borderBottomColor: colors.borderLight },
            isSelected && { backgroundColor: colors.primaryFaded },
          ]}
        >
          <View style={styles.pickerItemLeft}>
            <Text style={styles.pickerFlag}>{item.flag}</Text>
            <View style={styles.pickerItemInfo}>
              <Text style={[styles.pickerItemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.pickerItemSub, { color: colors.textTertiary }]}>
                {item.currency} · {item.cities.slice(0, 3).join(", ")}
                {item.cities.length > 3 ? ` +${item.cities.length - 3}` : ""}
              </Text>
            </View>
          </View>
          {isSelected && <Check size={18} color={colors.primary} />}
        </Pressable>
      );
    },
    [countryCode, colors, handleSelectCountry]
  );

  const renderCurrencyItem = useCallback(
    ({ item }: { item: CurrencyData }) => {
      const isSelected = item.code === currencyCode;
      return (
        <Pressable
          onPress={() => handleSelectCurrency(item)}
          style={[
            styles.pickerItem,
            { borderBottomColor: colors.borderLight },
            isSelected && { backgroundColor: colors.primaryFaded },
          ]}
        >
          <View style={styles.pickerItemLeft}>
            <View style={[styles.currencySymbolBg, { backgroundColor: colors.primaryFaded }]}>
              <Text style={[styles.currencySymbolText, { color: colors.primary }]}>{item.symbol}</Text>
            </View>
            <View style={styles.pickerItemInfo}>
              <Text style={[styles.pickerItemName, { color: colors.text }]}>{item.code}</Text>
              <Text style={[styles.pickerItemSub, { color: colors.textTertiary }]}>{item.name}</Text>
            </View>
          </View>
          {isSelected && <Check size={18} color={colors.primary} />}
        </Pressable>
      );
    },
    [currencyCode, colors, handleSelectCurrency]
  );

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

          <View style={[styles.locationBadge, { backgroundColor: colors.primaryFaded }]}>
            <MapPin size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.primary }]}>
              {country?.flag} {country?.name ?? "Not set"}{city ? ` · ${city}` : ""}
            </Text>
            <Text style={[styles.locationCurrency, { color: colors.textSecondary }]}>
              {currency?.symbol} {currencyCode}
            </Text>
          </View>

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
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>LOCATION & CURRENCY</Text>
          <View style={[styles.sectionCards, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => {
                setCountrySearch("");
                setShowCountryPicker(true);
              }}
            >
              <View style={styles.settingLeft}>
                <Globe size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Country</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
                  {country?.flag} {country?.name ?? "Select"}
                </Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => setShowCityPicker(true)}
            >
              <View style={styles.settingLeft}>
                <MapPin size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>City</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
                  {city || "Select city"}
                </Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => {
                setCurrencySearch("");
                setShowCurrencyPicker(true);
              }}
            >
              <View style={styles.settingLeft}>
                <DollarSign size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Currency</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
                  {currency?.symbol} {currencyCode}
                </Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
            <Pressable
              style={styles.settingRow}
              onPress={() => setShowStores(true)}
            >
              <View style={styles.settingLeft}>
                <Store size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Trusted Stores</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
                  {availableStores.length} stores
                </Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>APPEARANCE</Text>
          <View style={[styles.sectionCards, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Pressable
              style={styles.settingRow}
              onPress={() => setShowThemePicker(true)}
            >
              <View style={styles.settingLeft}>
                <Palette size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
                  {themeMode === "system" ? "System" : themeMode === "light" ? "Light" : "Dark"}
                </Text>
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
            <Pressable style={styles.settingRow} onPress={handleSignOut}>
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
            <View style={[styles.searchBarModal, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Search size={16} color={colors.textTertiary} />
              <TextInput
                placeholder="Search countries or cities..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.searchInputModal, { color: colors.text }]}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
              {countrySearch.length > 0 && (
                <Pressable onPress={() => setCountrySearch("")}>
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

      <Modal visible={showCurrencyPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <ArrowLeftRight size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
              </View>
              <Pressable onPress={() => setShowCurrencyPicker(false)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <View style={[styles.searchBarModal, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Search size={16} color={colors.textTertiary} />
              <TextInput
                placeholder="Search currencies..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.searchInputModal, { color: colors.text }]}
                value={currencySearch}
                onChangeText={setCurrencySearch}
                autoFocus
              />
              {currencySearch.length > 0 && (
                <Pressable onPress={() => setCurrencySearch("")}>
                  <X size={16} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              renderItem={renderCurrencyItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showCityPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select City in {country?.name ?? ""}
              </Text>
              <Pressable onPress={() => setShowCityPicker(false)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalList}>
              {availableCities.length === 0 ? (
                <View style={styles.emptyPicker}>
                  <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>
                    No cities available for this country
                  </Text>
                </View>
              ) : (
                availableCities.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => handleSelectCity(c)}
                    style={[
                      styles.pickerItem,
                      { borderBottomColor: colors.borderLight },
                      city === c && { backgroundColor: colors.primaryFaded },
                    ]}
                  >
                    <View style={styles.pickerItemLeft}>
                      <MapPin size={16} color={colors.textSecondary} />
                      <Text style={[styles.pickerItemName, { color: colors.text }]}>{c}</Text>
                    </View>
                    {city === c && <Check size={18} color={colors.primary} />}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showStores} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Trusted Stores in {country?.name ?? ""}
              </Text>
              <Pressable onPress={() => setShowStores(false)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalList}>
              {availableStores.length === 0 ? (
                <View style={styles.emptyPicker}>
                  <Text style={styles.emptyEmoji}>🏬</Text>
                  <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>
                    No trusted stores configured for this country yet.{"\n"}Search results will use global stores.
                  </Text>
                </View>
              ) : (
                availableStores.map((store, idx) => (
                  <View
                    key={`${store}-${idx}`}
                    style={[styles.storeItem, { borderBottomColor: colors.borderLight }]}
                  >
                    <View style={[styles.storeIcon, { backgroundColor: colors.primaryFaded }]}>
                      <Store size={16} color={colors.primary} />
                    </View>
                    <View style={styles.storeInfo}>
                      <Text style={[styles.storeName, { color: colors.text }]}>{store}</Text>
                      <Text style={[styles.storeStatus, { color: colors.success }]}>Verified</Text>
                    </View>
                    <CheckCircle2 size={16} color={colors.success} />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showThemePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Appearance</Text>
              <Pressable onPress={() => setShowThemePicker(false)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <View style={styles.themeOptionsContainer}>
              {([
                { mode: "system" as ThemeMode, label: "System", description: "Match device settings", Icon: Monitor },
                { mode: "light" as ThemeMode, label: "Light", description: "Always light theme", Icon: Sun },
                { mode: "dark" as ThemeMode, label: "Dark", description: "Always dark theme", Icon: Moon },
              ]).map(({ mode, label, description, Icon }) => {
                const isActive = themeMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      void setThemeMode(mode);
                      setShowThemePicker(false);
                    }}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isActive ? colors.primaryFaded : colors.surfaceSecondary,
                        borderColor: isActive ? colors.primary : colors.borderLight,
                      },
                    ]}
                  >
                    <View style={[
                      styles.themeIconBg,
                      { backgroundColor: isActive ? colors.primary : colors.border },
                    ]}>
                      <Icon size={22} color={isActive ? "#FFFFFF" : colors.textSecondary} />
                    </View>
                    <Text style={[styles.themeLabel, { color: isActive ? colors.primary : colors.text }]}>
                      {label}
                    </Text>
                    <Text style={[styles.themeDescription, { color: colors.textTertiary }]}>
                      {description}
                    </Text>
                    {isActive && (
                      <View style={[styles.themeCheckmark, { backgroundColor: colors.primary }]}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
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
    marginBottom: 14,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  locationCurrency: {
    fontSize: 12,
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
    flexShrink: 1,
  },
  settingValue: {
    fontSize: 14,
    maxWidth: 180,
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
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  searchBarModal: {
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
  searchInputModal: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  modalList: {
    paddingHorizontal: 12,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 2,
  },
  pickerItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pickerFlag: {
    fontSize: 26,
  },
  pickerItemInfo: {
    flex: 1,
    gap: 2,
  },
  pickerItemName: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  pickerItemSub: {
    fontSize: 12,
  },
  currencySymbolBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  currencySymbolText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  emptyPicker: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyPickerText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  storeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  storeInfo: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  storeStatus: {
    fontSize: 12,
    fontWeight: "500" as const,
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
  themeOptionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: "center" as const,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
    position: "relative" as const,
  },
  themeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  themeDescription: {
    fontSize: 11,
    textAlign: "center" as const,
    lineHeight: 14,
  },
  themeCheckmark: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  analyticsGrid: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  analyticItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 4,
  },
  analyticValue: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  analyticLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  analyticDivider: {
    width: 1,
    height: 40,
  },
  categorySection: {
    borderTopWidth: 1,
    padding: 16,
    gap: 10,
  },
  categorySectionTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  categoryBarRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  categoryBarLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500" as const,
  },
  categoryBarTrack: {
    flex: 2,
    height: 6,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  categoryBarFill: {
    height: "100%" as unknown as number,
    borderRadius: 3,
  },
  categoryBarCount: {
    fontSize: 11,
    width: 20,
    textAlign: "right" as const,
  },
});
