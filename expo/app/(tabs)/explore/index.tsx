import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X, TrendingUp, ShoppingBag, MapPin, Store } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { useLocation } from "@/providers/LocationProvider";
import { mockCategories } from "@/mocks/data";
import { searchProducts, SerpApiResult } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import { Product } from "@/types";

const FOOD_CATEGORIES = [
  { id: "fc1", name: "Food Delivery", emoji: "🍔", productCount: 0 },
  { id: "fc2", name: "Groceries", emoji: "🛒", productCount: 0 },
  { id: "fc3", name: "Restaurant", emoji: "🍽️", productCount: 0 },
];

const SHOPPING_CATEGORIES = [
  { id: "sc1", name: "Electronics", emoji: "📱", productCount: 0 },
  { id: "sc2", name: "Fashion", emoji: "👟", productCount: 0 },
  { id: "sc3", name: "Home & Decor", emoji: "🏡", productCount: 0 },
  { id: "sc4", name: "Beauty", emoji: "✨", productCount: 0 },
  { id: "sc5", name: "Technology", emoji: "💻", productCount: 0 },
  { id: "sc6", name: "Sports", emoji: "⚽", productCount: 0 },
  { id: "sc7", name: "Books", emoji: "📚", productCount: 0 },
  { id: "sc8", name: "Toys & Games", emoji: "🧸", productCount: 0 },
];

export default function ExploreScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { allProducts, trendingProducts } = useWishlistContext();
  const { country, serpApiCountryCode, availableStores, format } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [serpResults, setSerpResults] = useState<SerpApiResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      console.log(`[Explore] Searching SerpAPI for: "${query}" in ${serpApiCountryCode}`);
      const { results, error } = await searchProducts(query, serpApiCountryCode);
      if (error) {
        console.log("[Explore] Search error:", error);
      }
      return results;
    },
    onSuccess: (results) => {
      setSerpResults(results);
      setHasSearched(true);
      console.log(`[Explore] Got ${results.length} results from SerpAPI`);
    },
    onError: () => {
      setHasSearched(true);
    },
  });

  const localResults = useMemo(() => {
    if (searchQuery.length === 0) return [];
    const q = searchQuery.toLowerCase();
    return [...allProducts, ...trendingProducts].filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.store.toLowerCase().includes(q)
    );
  }, [searchQuery, allProducts, trendingProducts]);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    searchMutation.mutate(q);
  }, [searchQuery, searchMutation]);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setSerpResults([]);
    setHasSearched(false);
  }, []);

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      const countryName = country?.name ?? "";
      const storeQuery = availableStores.length > 0
        ? `${categoryName} ${countryName}`
        : `${categoryName} delivery ${countryName}`;
      setSearchQuery(storeQuery);
      searchMutation.mutate(storeQuery);
    },
    [searchMutation, country, availableStores]
  );

  const serpToProduct = useCallback(
    (result: SerpApiResult, index: number): Product => ({
      id: `serp_${index}_${Date.now()}`,
      title: result.title,
      image: result.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      price: result.price,
      currency: result.currency || "USD",
      store: result.store,
      storeUrl: result.link,
      description: result.snippet,
      category: "Search Result",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: serpApiCountryCode.toUpperCase(),
      rating: result.rating,
    }),
    [serpApiCountryCode]
  );

  const isSearchActive = searchQuery.length > 0;

  const allCategories = useMemo(() => {
    return [...FOOD_CATEGORIES, ...SHOPPING_CATEGORIES, ...mockCategories];
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
          <View style={[styles.locationChip, { backgroundColor: colors.primaryFaded }]}>
            <MapPin size={12} color={colors.primary} />
            <Text style={[styles.locationChipText, { color: colors.primary }]}>
              {country?.flag} {country?.name ?? "Set location"}
            </Text>
          </View>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            placeholder={`Search in ${country?.name ?? "your country"}...`}
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            testID="explore-search-input"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClear}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
        {isSearchActive && !searchMutation.isPending && (
          <Pressable
            onPress={handleSearch}
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            testID="explore-search-btn"
          >
            <Search size={16} color="#FFFFFF" />
            <Text style={styles.searchBtnText}>
              Search in {country?.name ?? "All Countries"}
            </Text>
          </Pressable>
        )}
      </View>

      {isSearchActive ? (
        <ScrollView contentContainerStyle={styles.searchResults} showsVerticalScrollIndicator={false}>
          {searchMutation.isPending && (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Searching stores in {country?.name ?? "your area"}...
              </Text>
            </View>
          )}

          {serpResults.length > 0 && !searchMutation.isPending && (
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <ShoppingBag size={16} color={colors.primary} />
                <Text style={[styles.resultSectionTitle, { color: colors.text }]}>
                  Results in {country?.name} ({serpResults.length})
                </Text>
              </View>
              {serpResults.map((result, idx) => {
                const product = serpToProduct(result, idx);
                const displayPrice = format(product.price, product.currency);
                return (
                  <Pressable
                    key={`serp-${idx}`}
                    onPress={() =>
                      router.push({
                        pathname: "/product-detail",
                        params: { id: product.id, serpData: JSON.stringify(result) },
                      })
                    }
                    style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                  >
                    <View style={styles.resultCardContent}>
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
                          {product.title}
                        </Text>
                        <View style={styles.resultMeta}>
                          <Store size={12} color={colors.textTertiary} />
                          <Text style={[styles.resultStore, { color: colors.textTertiary }]}>
                            {product.store}
                          </Text>
                        </View>
                        <Text style={[styles.resultPrice, { color: colors.primary }]}>
                          {displayPrice}
                        </Text>
                        {result.delivery && (
                          <Text style={[styles.resultDelivery, { color: colors.success }]}>
                            {result.delivery}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {localResults.length > 0 && (
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <Search size={16} color={colors.textSecondary} />
                <Text style={[styles.resultSectionTitle, { color: colors.text }]}>
                  In Your Wishlists ({localResults.length})
                </Text>
              </View>
              {localResults.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="horizontal"
                  onPress={() =>
                    router.push({ pathname: "/product-detail", params: { id: product.id } })
                  }
                />
              ))}
            </View>
          )}

          {hasSearched &&
            serpResults.length === 0 &&
            localResults.length === 0 &&
            !searchMutation.isPending && (
              <View style={styles.emptySearch}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Try searching with different keywords or change your country
                </Text>
              </View>
            )}

          {!hasSearched &&
            localResults.length === 0 &&
            !searchMutation.isPending && (
              <View style={styles.emptySearch}>
                <Text style={styles.emptyEmoji}>🔎</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Tap "Search in {country?.name}"
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  We'll find items from trusted stores that deliver to you
                </Text>
              </View>
            )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {availableStores.length > 0 && (
            <>
              <SectionHeader title={`Stores in ${country?.name ?? "your area"}`} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storesRow}
              >
                {availableStores.map((store, idx) => (
                  <Pressable
                    key={`store-${idx}`}
                    onPress={() => {
                      const q = `${store} ${country?.name ?? ""}`;
                      setSearchQuery(q);
                      searchMutation.mutate(q);
                    }}
                    style={[styles.storeChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                  >
                    <View style={[styles.storeChipIcon, { backgroundColor: colors.primaryFaded }]}>
                      <Store size={14} color={colors.primary} />
                    </View>
                    <Text style={[styles.storeChipText, { color: colors.text }]}>{store}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <SectionHeader title="Browse Categories" />
          <View style={styles.categoriesGrid}>
            {allCategories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handleCategoryPress(category.name)}
                style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Trending Now" />
          <View style={styles.trendingBanner}>
            <View style={[styles.trendingCard, { backgroundColor: colors.primaryFaded }]}>
              <TrendingUp size={20} color={colors.primary} />
              <Text style={[styles.trendingTitle, { color: colors.primary }]}>
                Most wishlisted this week
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {trendingProducts.map((item, index) => (
              <View key={item.id} style={index > 0 ? { marginLeft: 12 } : undefined}>
                <ProductCard
                  product={item}
                  onPress={() =>
                    router.push({ pathname: "/product-detail", params: { id: item.id } })
                  }
                />
              </View>
            ))}
          </ScrollView>

          <SectionHeader title="Featured Products" />
          <View style={styles.featuredList}>
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="horizontal"
                onPress={() =>
                  router.push({ pathname: "/product-detail", params: { id: product.id } })
                }
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  storesRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  storeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  storeChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  storeChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryCard: {
    width: "47%" as unknown as number,
    flexBasis: "47%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  trendingBanner: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  trendingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  searchResults: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  resultSection: {
    marginBottom: 20,
  },
  resultSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  resultCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  resultCardContent: {
    flexDirection: "row",
    gap: 12,
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resultStore: {
    fontSize: 12,
  },
  resultPrice: {
    fontSize: 18,
    fontWeight: "800" as const,
    marginTop: 4,
  },
  resultDelivery: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  emptySearch: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
