import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, ChevronRight, Sparkles } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import WishlistCard from "@/components/WishlistCard";
import ProductCard from "@/components/ProductCard";

const appLogo = require("@/assets/images/logo.png");

export default function HomeScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, myLists, sharedLists, trendingProducts, refreshWishlists } = useWishlistContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshWishlists();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshWishlists]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
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
            <Pressable onPress={() => router.push("/(tabs)/profile")}>
              <Image
                source={user.avatar ? { uri: user.avatar } : require("@/assets/images/icon.png")}
                style={[styles.avatar, { borderColor: colors.primary + "40" }]}
              />
            </Pressable>
          </View>

          <View style={styles.quickStats}>
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
            {myLists.map((item) => (
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

        {trendingProducts.length > 0 && (
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    marginLeft: 12,
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
});
