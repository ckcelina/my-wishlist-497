import React, { useState, useCallback } from "react";
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
import { Search, X, TrendingUp, ShoppingBag } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { mockCategories } from "@/mocks/data";
import { searchProducts, SerpApiResult } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import { Product } from "@/types";

export default function ExploreScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { allProducts, trendingProducts } = useWishlistContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [serpResults, setSerpResults] = useState<SerpApiResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      console.log("[Explore] Searching SerpAPI for:", query);
      const { results, error } = await searchProducts(query);
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
    onError: (err) => {
      console.log("[Explore] Search mutation error:", err);
      setHasSearched(true);
    },
  });

  const localResults = searchQuery.length > 0
    ? [...allProducts, ...trendingProducts].filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.store.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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

  const handleCategoryPress = useCallback((categoryName: string) => {
    setSearchQuery(categoryName);
    searchMutation.mutate(categoryName);
  }, [searchMutation]);

  const serpToProduct = useCallback((result: SerpApiResult, index: number): Product => ({
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
    country: "US",
    rating: result.rating,
  }), []);

  const isSearchActive = searchQuery.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            placeholder="Search products, stores, categories..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
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
          >
            <Search size={16} color="#FFFFFF" />
            <Text style={styles.searchBtnText}>Search Online</Text>
          </Pressable>
        )}
      </View>

      {isSearchActive ? (
        <ScrollView contentContainerStyle={styles.searchResults} showsVerticalScrollIndicator={false}>
          {searchMutation.isPending && (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Searching stores worldwide...
              </Text>
            </View>
          )}

          {serpResults.length > 0 && !searchMutation.isPending && (
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <ShoppingBag size={16} color={colors.primary} />
                <Text style={[styles.resultSectionTitle, { color: colors.text }]}>
                  Online Results ({serpResults.length})
                </Text>
              </View>
              {serpResults.map((result, idx) => {
                const product = serpToProduct(result, idx);
                return (
                  <ProductCard
                    key={`serp-${idx}`}
                    product={product}
                    variant="horizontal"
                    onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id, serpData: JSON.stringify(result) } })}
                  />
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
                  onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } })}
                />
              ))}
            </View>
          )}

          {hasSearched && serpResults.length === 0 && localResults.length === 0 && !searchMutation.isPending && (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Try searching with different keywords
              </Text>
            </View>
          )}

          {!hasSearched && localResults.length === 0 && !searchMutation.isPending && (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Tap "Search Online"</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Or press enter to search stores worldwide
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <SectionHeader title="Categories" />
          <View style={styles.categoriesGrid}>
            {mockCategories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handleCategoryPress(category.name)}
                style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                <Text style={[styles.categoryCount, { color: colors.textTertiary }]}>
                  {category.productCount} items
                </Text>
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

          <SectionHeader title="Featured Products" />
          <View style={styles.featuredList}>
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="horizontal"
                onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } })}
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
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 16,
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
  categoryCount: {
    fontSize: 12,
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
  },
});
