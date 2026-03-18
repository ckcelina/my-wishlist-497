import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  TextInput,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Gift, Sparkles, Plus } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import WishlistCard from "@/components/WishlistCard";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";

const appLogo = require("@/assets/images/logo.png");

export default function HomeScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, myLists, sharedLists, allProducts, trendingProducts, refreshWishlists } = useWishlistContext();
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
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
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

  const recentProducts = allProducts.slice(0, 4);

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
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user.name} <Text style={styles.wave}>{"👋"}</Text>
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

          <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Search size={18} color={colors.textTertiary} />
            <TextInput
              placeholder="Search products, lists..."
              placeholderTextColor={colors.textTertiary}
              style={[styles.searchInput, { color: colors.text }]}
              editable={false}
              onPressIn={() => router.push("/(tabs)/explore")}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
              <Gift size={18} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {myLists.length + sharedLists.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lists</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {allProducts.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Items</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
              <Text style={styles.statEmoji}>{"🤝"}</Text>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {sharedLists.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Shared</Text>
            </View>
          </View>
        </Animated.View>

        <SectionHeader title="My Lists" onSeeAll={() => router.push("/create-list")} />
        {myLists.length === 0 ? (
          <Pressable
            onPress={() => router.push("/create-list")}
            style={[styles.emptyListCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "30" }]}
          >
            <View style={[styles.emptyListIcon, { backgroundColor: colors.primary + "20" }]}>
              <Plus size={24} color={colors.primary} />
            </View>
            <Text style={[styles.emptyListTitle, { color: colors.text }]}>Create your first wishlist</Text>
            <Text style={[styles.emptyListDesc, { color: colors.textSecondary }]}>Start saving products you love</Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            <Pressable
              onPress={() => router.push("/create-list")}
              style={[styles.createListCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "30" }]}
            >
              <View style={[styles.createListIconWrap, { backgroundColor: colors.primary + "20" }]}>
                <Plus size={22} color={colors.primary} />
              </View>
              <Text style={[styles.createListText, { color: colors.primary }]}>New List</Text>
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
            <SectionHeader title="Shared With Me" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
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

        <SectionHeader title="Recently Added" onSeeAll={() => router.push("/(tabs)/explore")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {recentProducts.map((item, index) => (
            <View key={item.id} style={index > 0 ? { marginLeft: 12 } : undefined}>
              <ProductCard
                product={item}
                onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
              />
            </View>
          ))}
        </ScrollView>

        <SectionHeader title="Trending Wishes" onSeeAll={() => router.push("/(tabs)/explore")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {trendingProducts.map((item, index) => (
            <View key={item.id} style={index > 0 ? { marginLeft: 12 } : undefined}>
              <ProductCard
                product={item}
                onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
              />
            </View>
          ))}
        </ScrollView>
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
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  greetingContent: {
    gap: 2,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  userName: {
    fontSize: 26,
    fontWeight: "800" as const,
  },
  wave: {
    fontSize: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800" as const,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  statEmoji: {
    fontSize: 18,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  emptyListCard: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  emptyListIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  emptyListDesc: {
    fontSize: 13,
  },
  createListCard: {
    width: 120,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
  },
  createListIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  createListText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
