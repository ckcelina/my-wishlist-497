import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, ChevronRight, Sparkles, MapPin, Bell, TrendingUp, ShoppingBag } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { useLocation } from "@/providers/LocationProvider";
import { usePriceAlerts } from "@/providers/PriceAlertProvider";
import { fetchTrendingProducts, SerpApiResult } from "@/lib/api";
import WishlistCard from "@/components/WishlistCard";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

const appLogo = require("@/assets/images/logo.png");

export default function HomeScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, myLists, sharedLists, trendingProducts, refreshWishlists } = useWishlistContext();
  const { country, city, currency, serpApiCountryCode, format } = useLocation();
  const { unreadDropCount, activeAlertCount, checkPricesNow, isCheckingPrices } = usePriceAlerts();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"updated" | "name" | "items">("updated");
  const [liveTrending, setLiveTrending] = useState<SerpApiResult[]>([]);

  const trendingMutation = useMutation({
    mutationFn: async () => {
      console.log(`[Home] Fetching live trending for ${serpApiCountryCode}`);
      return fetchTrendingProducts(serpApiCountryCode);
    },
    onSuccess: (data) => {
      if (data.results && data.results.length > 0) {
        setLiveTrending(data.results);
        console.log(`[Home] Got ${data.results.length} trending results`);
      }
    },
  });

  useEffect(() => {
    trendingMutation.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serpApiCountryCode]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshWishlists();
    trendingMutation.mutate();
    if (activeAlertCount > 0) {
      checkPricesNow();
    }
    setTimeout(() => setRefreshing(false), 1200);
  }, [refreshWishlists, trendingMutation, activeAlertCount, checkPricesNow]);

  const serpToProduct = useCallback(
    (result: SerpApiResult, index: number): Product => ({
      id: `trending_${index}_${Date.now()}`,
      title: result.title,
      image: result.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      price: result.price,
      currency: result.currency || "USD",
      store: result.store,
      storeUrl: result.link,
      description: result.snippet,
      category: "Trending",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: serpApiCountryCode.toUpperCase(),
      rating: result.rating,
    }),
    [serpApiCountryCode]
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  }, []);

  const totalItems = useMemo(() => {
    return [...myLists, ...sharedLists].reduce((sum, l) => sum + l.items.length, 0);
  }, [myLists, sharedLists]);

  const allLists = useMemo(() => [...myLists, ...sharedLists], [myLists, sharedLists]);

  const sortedMyLists = useMemo(() => {
    switch (sortBy) {
      case "name":
        return [...myLists].sort((a, b) => a.title.localeCompare(b.title));
      case "items":
        return [...myLists].sort((a, b) => b.items.length - a.items.length);
      default:
        return [...myLists].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  }, [myLists, sortBy]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View
          style={[
            styles.header,
            { paddingTop: insets.top + 12, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.greetingRow}>
            <View style={styles.greetingLeft}>
              <Image source={appLogo} style={styles.logo} contentFit="contain" />
              <View style={styles.greetingContent}>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  {greeting}
                </Text>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {user.name}
                </Text>
              </View>
            </View>
            <View style={styles.headerRightActions}>
              <Pressable
                onPress={() => router.push("/notifications" as never)}
                style={[styles.notifBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Bell size={20} color={colors.text} />
                {unreadDropCount > 0 && (
                  <View style={[styles.notifDot, { backgroundColor: colors.error }]}>
                    <Text style={styles.notifDotText}>{unreadDropCount > 9 ? "9+" : unreadDropCount}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/profile")}>
                <Image
                  source={user.avatar ? { uri: user.avatar } : require("@/assets/images/icon.png")}
                  style={[styles.avatar, { borderColor: colors.primary + "40" }]}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={[styles.locationBar, { backgroundColor: colors.primaryFaded }]}
          >
            <MapPin size={14} color={colors.primary} />
            <Text style={[styles.locationBarText, { color: colors.primary }]}>
              {country?.flag} {country?.name ?? "Set your location"}{city ? ` · ${city}` : ""}
            </Text>
            <Text style={[styles.locationCurrency, { color: colors.textSecondary }]}>
              {currency?.symbol} {currency?.code}
            </Text>
            <ChevronRight size={14} color={colors.primary} />
          </Pressable>

          <View style={styles.quickStats} testID="home-quick-stats">
            <View style={[styles.statPill, { backgroundColor: colors.primaryFaded }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{allLists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lists</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.primaryFaded }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{totalItems}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Items</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.primaryFaded }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{sharedLists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Shared</Text>
            </View>
          </View>
        </Animated.View>

        {allLists.length > 2 && (
          <View style={styles.sortBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortBarContent}
            >
              {([
                { key: "updated" as const, label: "⏰ Latest" },
                { key: "name" as const, label: "🔤 A–Z" },
                { key: "items" as const, label: "📦 Most Items" },
              ]).map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setSortBy(opt.key)}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: sortBy === opt.key ? colors.primary : colors.surface,
                      borderColor: sortBy === opt.key ? colors.primary : colors.borderLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      { color: sortBy === opt.key ? "#FFFFFF" : colors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Wishlists</Text>
          {myLists.length > 0 && (
            <Pressable
              onPress={() => router.push("/create-list")}
              style={[styles.sectionAction, { backgroundColor: colors.primaryFaded }]}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={[styles.sectionActionText, { color: colors.primary }]}>New</Text>
            </Pressable>
          )}
        </View>

        {myLists.length === 0 ? (
          <Pressable
            onPress={() => router.push("/create-list")}
            style={[styles.emptyListCard, { borderColor: colors.border }]}
            testID="create-first-wishlist"
          >
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryFaded }]}>
              <Plus size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Create your first wishlist</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Start saving products and gift ideas
            </Text>
          </Pressable>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            <Pressable
              onPress={() => router.push("/create-list")}
              style={[styles.createCard, { borderColor: colors.primary + "30" }]}
              testID="create-new-wishlist"
            >
              <View style={[styles.createIconCircle, { backgroundColor: colors.primaryFaded }]}>
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.createCardText, { color: colors.primary }]}>New</Text>
            </Pressable>
            {sortedMyLists.map((item) => (
              <View key={item.id} style={{ marginLeft: 12 }}>
                <WishlistCard
                  wishlist={item}
                  onPress={() => router.push({ pathname: "/wishlist-detail", params: { id: item.id } })}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {sharedLists.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Shared With Me</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.primaryFaded }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>{sharedLists.length}</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {sharedLists.map((item, index) => (
                <View key={item.id} style={index > 0 ? { marginLeft: 12 } : undefined}>
                  <WishlistCard
                    wishlist={item}
                    onPress={() => router.push({ pathname: "/wishlist-detail", params: { id: item.id } })}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {activeAlertCount > 0 && (
          <Pressable
            onPress={() => router.push("/price-alerts" as never)}
            style={[styles.alertBanner, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "25" }]}
          >
            <View style={[styles.alertBannerIcon, { backgroundColor: colors.primary + "20" }]}>
              <Bell size={16} color={colors.primary} />
            </View>
            <View style={styles.alertBannerContent}>
              <Text style={[styles.alertBannerTitle, { color: colors.text }]}>
                {activeAlertCount} Price Alert{activeAlertCount !== 1 ? "s" : ""} Active
              </Text>
              <Text style={[styles.alertBannerSub, { color: colors.textSecondary }]}>
                {isCheckingPrices ? "Checking prices..." : "Tap to manage your alerts"}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        )}

        {liveTrending.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <TrendingUp size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending in {country?.name ?? "your area"}</Text>
              </View>
              <Pressable
                onPress={() => router.push("/(tabs)/explore")}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {liveTrending.slice(0, 8).map((item, index) => {
                const product = serpToProduct(item, index);
                return (
                  <Pressable
                    key={`live-trending-${index}`}
                    onPress={() =>
                      router.push({
                        pathname: "/product-detail",
                        params: { id: product.id, serpData: JSON.stringify(item) },
                      })
                    }
                    style={[
                      styles.trendingCard,
                      { backgroundColor: colors.surface, borderColor: colors.borderLight },
                      index > 0 ? { marginLeft: 12 } : undefined,
                    ]}
                  >
                    <Image source={{ uri: item.image }} style={styles.trendingImage} contentFit="cover" />
                    <View style={styles.trendingInfo}>
                      <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View style={[styles.trendingStoreTag, { backgroundColor: colors.surfaceSecondary }]}>
                        <ShoppingBag size={9} color={colors.textTertiary} />
                        <Text style={[styles.trendingStore, { color: colors.textTertiary }]}>{item.store}</Text>
                      </View>
                      <Text style={[styles.trendingPrice, { color: colors.primary }]}>
                        {format(item.price, item.currency)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {trendingProducts.length > 0 && liveTrending.length === 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending</Text>
              </View>
              <Pressable
                onPress={() => router.push("/(tabs)/explore")}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {trendingProducts.slice(0, 6).map((item, index) => (
                <View key={item.id} style={index > 0 ? { marginLeft: 12 } : undefined}>
                  <ProductCard
                    product={item}
                    onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  greetingContent: {
    gap: 2,
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800" as const,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    position: "relative" as const,
  },
  notifDot: {
    position: "absolute" as const,
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 3,
  },
  notifDotText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700" as const,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  locationBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  locationBarText: {
    fontSize: 13,
    fontWeight: "600" as const,
    flex: 1,
  },
  locationCurrency: {
    fontSize: 12,
  },
  quickStats: {
    flexDirection: "row",
    gap: 10,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800" as const,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 24,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  emptyListCard: {
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: "dashed" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center" as const,
  },
  createCard: {
    width: 90,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 20,
  },
  createIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  createCardText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  alertBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 20,
  },
  alertBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  alertBannerContent: {
    flex: 1,
    gap: 2,
  },
  alertBannerTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  alertBannerSub: {
    fontSize: 12,
  },
  trendingCard: {
    width: 160,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden" as const,
  },
  trendingImage: {
    width: "100%" as const,
    height: 120,
  },
  trendingInfo: {
    padding: 10,
    gap: 4,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    lineHeight: 17,
  },
  trendingStoreTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  trendingStore: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  trendingPrice: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginTop: 2,
  },
  sortBar: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  sortBarContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
