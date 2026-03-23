import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  X,
  ShoppingBag,
  MapPin,
  Store,
  Clock,
  Trash2,
  Tag,
  Flame,
  Star,
  Sparkles,
  ArrowRight,
  Zap,
  Eye,
  ArrowLeftRight,
} from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { useLocation } from "@/providers/LocationProvider";
import { useSearchHistory } from "@/providers/SearchHistoryProvider";
import { usePriceAlerts } from "@/providers/PriceAlertProvider";
import { searchProducts, fetchDeals, SerpApiResult } from "@/lib/api";
import SearchFilters, { FilterState, SortOption } from "@/components/SearchFilters";
import { Product } from "@/types";

const POPULAR_SEARCHES = [
  { label: "AirPods Pro", emoji: "🎧" },
  { label: "iPhone 16", emoji: "📱" },
  { label: "Nike Dunks", emoji: "👟" },
  { label: "PS5", emoji: "🎮" },
  { label: "Dyson V15", emoji: "🧹" },
  { label: "Samsung TV", emoji: "📺" },
  { label: "MacBook Air", emoji: "💻" },
  { label: "Perfume", emoji: "🌸" },
];

const DEAL_CATEGORIES = [
  { id: "deals", label: "All Deals", emoji: "🔥" },
  { id: "electronics", label: "Electronics", emoji: "📱" },
  { id: "fashion", label: "Fashion", emoji: "👗" },
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "beauty", label: "Beauty", emoji: "💄" },
  { id: "tech", label: "Tech", emoji: "💻" },
];

const BROWSE_CATEGORIES = [
  { id: "bc1", name: "Food Delivery", emoji: "🍔" },
  { id: "bc2", name: "Groceries", emoji: "🛒" },
  { id: "bc3", name: "Electronics", emoji: "📱" },
  { id: "bc4", name: "Fashion", emoji: "👟" },
  { id: "bc5", name: "Home & Decor", emoji: "🏡" },
  { id: "bc6", name: "Beauty", emoji: "✨" },
  { id: "bc7", name: "Technology", emoji: "💻" },
  { id: "bc8", name: "Sports", emoji: "⚽" },
  { id: "bc9", name: "Books", emoji: "📚" },
  { id: "bc10", name: "Toys & Games", emoji: "🧸" },
  { id: "bc11", name: "Restaurant", emoji: "🍽️" },
  { id: "bc12", name: "Garden", emoji: "🌱" },
];

function SkeletonCard({ colors }: { colors: ReturnType<typeof useAppColors> }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonCard,
        { backgroundColor: colors.surface, borderColor: colors.borderLight, opacity: pulseAnim },
      ]}
    >
      <View style={[styles.skeletonImage, { backgroundColor: colors.surfaceSecondary }]} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceSecondary, width: "80%" }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceSecondary, width: "50%" }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceSecondary, width: "30%" }]} />
      </View>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { allProducts, recentlyViewed } = useWishlistContext();
  const { country, serpApiCountryCode, format, getCurrencySymbol, currencyCode } = useLocation();
  const { getRecentSearches, getSuggestions, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { activeAlertCount } = usePriceAlerts();

  const [searchQuery, setSearchQuery] = useState("");
  const [serpResults, setSerpResults] = useState<SerpApiResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [dealResults, setDealResults] = useState<SerpApiResult[]>([]);
  const [selectedDealCategory, setSelectedDealCategory] = useState<string | null>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ sortBy: "relevance" as SortOption });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [convertAmount, setConvertAmount] = useState("");

  const searchInputRef = useRef<TextInput>(null);
  const prevCountryRef = useRef<string>(serpApiCountryCode);

  useEffect(() => {
    if (prevCountryRef.current === serpApiCountryCode) return;
    prevCountryRef.current = serpApiCountryCode;
    console.log(`[Explore] Country changed to ${serpApiCountryCode}, clearing results`);
    setSerpResults([]);
    setDealResults([]);
    setSelectedDealCategory(null);
    setHasSearched(false);
    setSearchError(null);
    setLastSearchedQuery("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serpApiCountryCode]);

  const recentSearches = useMemo(() => getRecentSearches(8), [getRecentSearches]);
  const suggestions = useMemo(
    () => (searchQuery.length > 0 ? getSuggestions(searchQuery, 5) : []),
    [searchQuery, getSuggestions]
  );

  const searchMutation = useMutation({
    mutationFn: async ({ query, appliedFilters }: { query: string; appliedFilters?: FilterState }) => {
      const f = appliedFilters ?? filters;
      console.log(`[Explore] Searching Google Shopping for: "${query}" in ${serpApiCountryCode}`, f);
      setSearchError(null);
      const { results, error } = await searchProducts(query, serpApiCountryCode, {
        minPrice: f.minPrice,
        maxPrice: f.maxPrice,
        sortBy: f.sortBy !== "relevance" ? f.sortBy : undefined,
      });
      if (error) {
        console.log("[Explore] Search error:", error);
      }
      return { results, query, error };
    },
    onSuccess: ({ results, query, error }) => {
      setSerpResults(results);
      setSearchError(error);
      setHasSearched(true);
      setLastSearchedQuery(query);
      setShowSearchHistory(false);
      if (results.length > 0) {
        void addSearch(query, serpApiCountryCode, results.length);
      }
      console.log(`[Explore] Got ${results.length} results. Error: ${error ?? "none"}`);
    },
    onError: (err) => {
      console.log("[Explore] Search mutation error:", err);
      setSearchError("Search failed. Please check your connection and try again.");
      setHasSearched(true);
      setShowSearchHistory(false);
    },
  });

  const dealsMutation = useMutation({
    mutationFn: async (category: string) => {
      console.log(`[Explore] Fetching deals: ${category} in ${serpApiCountryCode}`);
      return fetchDeals(serpApiCountryCode, category);
    },
    onSuccess: (data) => {
      setDealResults(data.results);
      console.log(`[Explore] Got ${data.results.length} deal results`);
    },
    onError: (err) => {
      console.log("[Explore] Deals fetch error:", err);
    },
  });

  const localResults = useMemo(() => {
    if (searchQuery.length === 0) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.store.toLowerCase().includes(q)
    );
  }, [searchQuery, allProducts]);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    searchMutation.mutate({ query: q });
  }, [searchQuery, searchMutation]);

  const handleHistorySearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      searchMutation.mutate({ query });
    },
    [searchMutation]
  );

  const handlePopularSearch = useCallback(
    (label: string) => {
      setSearchQuery(label);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      searchMutation.mutate({ query: label });
    },
    [searchMutation]
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setSerpResults([]);
    setHasSearched(false);
    setLastSearchedQuery("");
    setShowSearchHistory(false);
    setSearchError(null);
    setConvertAmount("");
    setFilters({ sortBy: "relevance" as SortOption });
  }, []);

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      setSearchQuery(categoryName);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      searchMutation.mutate({ query: categoryName });
    },
    [searchMutation]
  );

  const handleDealCategoryPress = useCallback(
    (categoryId: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDealCategory(categoryId);
      dealsMutation.mutate(categoryId);
    },
    [dealsMutation]
  );

  const handleFilterApply = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      if (hasSearched && searchQuery.trim().length >= 2) {
        searchMutation.mutate({ query: searchQuery.trim(), appliedFilters: newFilters });
      }
    },
    [hasSearched, searchQuery, searchMutation]
  );

  const handleFilterReset = useCallback(() => {
    const resetFilters: FilterState = { sortBy: "relevance" as SortOption };
    setFilters(resetFilters);
    if (hasSearched && searchQuery.trim().length >= 2) {
      searchMutation.mutate({ query: searchQuery.trim(), appliedFilters: resetFilters });
    }
  }, [hasSearched, searchQuery, searchMutation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (hasSearched && searchQuery.trim().length >= 2) {
      searchMutation.mutate({ query: searchQuery.trim() });
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [hasSearched, searchQuery, searchMutation]);

  const serpToProduct = useCallback(
    (result: SerpApiResult, index: number): Product => ({
      id: `serp_${index}_${Date.now()}`,
      title: result.title,
      image: result.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      price: result.price,
      currency: result.currency || currencyCode,
      store: result.store,
      storeUrl: result.link,
      description: result.snippet,
      category: "Search Result",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: serpApiCountryCode.toUpperCase(),
      rating: result.rating,
    }),
    [serpApiCountryCode, currencyCode]
  );

  const filteredSerpResults = useMemo(() => {
    let results = [...serpResults];
    if (filters.freeDeliveryOnly) {
      results = results.filter(
        (r) => r.delivery?.toLowerCase().includes("free") || !r.delivery
      );
    }
    if (filters.storeFilter) {
      const sq = filters.storeFilter.toLowerCase();
      results = results.filter((r) => r.store.toLowerCase().includes(sq));
    }
    return results;
  }, [serpResults, filters.freeDeliveryOnly, filters.storeFilter]);

  const [convertFromCurrency, setConvertFromCurrency] = useState<string>("USD");

  const convertedAmount = useMemo(() => {
    const num = parseFloat(convertAmount);
    if (!convertAmount || isNaN(num) || num <= 0) return null;
    return format(num, convertFromCurrency);
  }, [convertAmount, format, convertFromCurrency]);

  const isSearchActive = searchQuery.length > 0 || hasSearched;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
              Find the best deals worldwide
            </Text>
          </View>
          <View style={styles.headerRight}>
            {activeAlertCount > 0 && (
              <View style={[styles.alertBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.alertBadgeText}>{activeAlertCount}</Text>
              </View>
            )}
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={[styles.locationChip, { backgroundColor: colors.primaryFaded }]}
            >
              <MapPin size={12} color={colors.primary} />
              <Text style={[styles.locationChipText, { color: colors.primary }]} numberOfLines={1}>
                {country?.flag} {country?.name ?? "Set location"}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            ref={searchInputRef}
            placeholder={`Search products in ${country?.name ?? "your country"}...`}
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length === 0) {
                setShowSearchHistory(false);
                setHasSearched(false);
                setSerpResults([]);
              } else {
                setShowSearchHistory(true);
              }
            }}
            onFocus={() => {
              if (searchQuery.length === 0 && recentSearches.length > 0) {
                setShowSearchHistory(true);
              }
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            testID="explore-search-input"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
        {searchQuery.trim().length > 1 && !searchMutation.isPending && (!hasSearched || searchQuery.trim() !== lastSearchedQuery) && (
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

      {showSearchHistory && !hasSearched && searchQuery.length === 0 && recentSearches.length > 0 ? (
        <ScrollView contentContainerStyle={styles.historyContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleRow}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={[styles.historyTitle, { color: colors.text }]}>Recent Searches</Text>
            </View>
            <Pressable onPress={() => { void clearHistory(); setShowSearchHistory(false); }}>
              <Text style={[styles.clearBtn, { color: colors.error }]}>Clear All</Text>
            </Pressable>
          </View>
          {recentSearches.map((item, idx) => (
            <Pressable
              key={`history-${idx}`}
              onPress={() => handleHistorySearch(item.query)}
              style={[styles.historyItem, { borderBottomColor: colors.borderLight }]}
            >
              <Clock size={14} color={colors.textTertiary} />
              <View style={styles.historyItemContent}>
                <Text style={[styles.historyQuery, { color: colors.text }]}>{item.query}</Text>
                {item.resultCount !== undefined && (
                  <Text style={[styles.historyMeta, { color: colors.textTertiary }]}>
                    {item.resultCount} results
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => { void removeSearch(item.query); }}
                hitSlop={8}
              >
                <Trash2 size={14} color={colors.textTertiary} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      ) : showSearchHistory && suggestions.length > 0 && !hasSearched ? (
        <ScrollView contentContainerStyle={styles.historyContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleRow}>
              <Search size={16} color={colors.textSecondary} />
              <Text style={[styles.historyTitle, { color: colors.text }]}>Suggestions</Text>
            </View>
          </View>
          {suggestions.map((item, idx) => (
            <Pressable
              key={`suggestion-${idx}`}
              onPress={() => handleHistorySearch(item.query)}
              style={[styles.historyItem, { borderBottomColor: colors.borderLight }]}
            >
              <Search size={14} color={colors.textTertiary} />
              <View style={styles.historyItemContent}>
                <Text style={[styles.historyQuery, { color: colors.text }]}>{item.query}</Text>
              </View>
              <ArrowRight size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
        </ScrollView>
      ) : isSearchActive && hasSearched ? (
        <View style={{ flex: 1 }}>
          <SearchFilters
            filters={filters}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
            currencySymbol={getCurrencySymbol(currencyCode)}
          />
          <ScrollView
            contentContainerStyle={styles.searchResults}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
          >
            {searchMutation.isPending && (
              <View style={styles.skeletonContainer}>
                <View style={styles.loadingHeader}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Searching stores in {country?.name ?? "your area"}...
                  </Text>
                </View>
                {[0, 1, 2].map((i) => (
                  <SkeletonCard key={`skeleton-${i}`} colors={colors} />
                ))}
              </View>
            )}

            {filteredSerpResults.length > 0 && !searchMutation.isPending && (
              <View style={styles.resultSection}>
                <View style={styles.resultSectionHeader}>
                  <View style={[styles.resultBadge, { backgroundColor: colors.primaryFaded }]}>
                    <ShoppingBag size={14} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.resultSectionTitle, { color: colors.text }]}>
                      {filteredSerpResults.length} Results Found{filters.storeFilter || filters.freeDeliveryOnly ? " (filtered)" : ""}
                    </Text>
                    <Text style={[styles.resultSectionSub, { color: colors.textTertiary }]}>
                      in {country?.name} · prices in {currencyCode}
                    </Text>
                  </View>
                </View>
                {filteredSerpResults.map((result, idx) => {
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
                        {result.image ? (
                          <Image source={{ uri: result.image }} style={styles.resultImage} contentFit="cover" />
                        ) : (
                          <View style={[styles.resultImagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                            <ShoppingBag size={20} color={colors.textTertiary} />
                          </View>
                        )}
                        <View style={styles.resultInfo}>
                          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
                            {product.title}
                          </Text>
                          <View style={styles.resultMeta}>
                            <View style={[styles.storeTag, { backgroundColor: colors.surfaceSecondary }]}>
                              <Store size={10} color={colors.textTertiary} />
                              <Text style={[styles.resultStore, { color: colors.textSecondary }]}>
                                {product.store}
                              </Text>
                            </View>
                            {result.rating !== undefined && (
                              <View style={styles.ratingRow}>
                                <Star size={10} color="#FFB300" fill="#FFB300" />
                                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                                  {result.rating}
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.resultBottom}>
                            <Text style={[styles.resultPrice, { color: colors.primary }]}>
                              {displayPrice}
                            </Text>
                            {!!result.delivery && (
                              <View style={[styles.deliveryTag, { backgroundColor: colors.success + "12" }]}>
                                <Text style={[styles.resultDelivery, { color: colors.success }]}>
                                  {result.delivery}
                                </Text>
                              </View>
                            )}
                          </View>
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
                  <View style={[styles.resultBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <Search size={14} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.resultSectionTitle, { color: colors.text }]}>
                    In Your Wishlists ({localResults.length})
                  </Text>
                </View>
                {localResults.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() =>
                      router.push({ pathname: "/product-detail", params: { id: product.id } })
                    }
                    style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                  >
                    <View style={styles.resultCardContent}>
                      <Image source={{ uri: product.image }} style={styles.resultImage} contentFit="cover" />
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
                          {product.title}
                        </Text>
                        <View style={styles.resultMeta}>
                          <View style={[styles.storeTag, { backgroundColor: colors.surfaceSecondary }]}>
                            <Store size={10} color={colors.textTertiary} />
                            <Text style={[styles.resultStore, { color: colors.textSecondary }]}>
                              {product.store}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.resultPrice, { color: colors.primary }]}>
                          {format(product.price, product.currency)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {hasSearched &&
              filteredSerpResults.length === 0 &&
              localResults.length === 0 &&
              !searchMutation.isPending && (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptyEmoji}>{searchError ? "⚠️" : "🔍"}</Text>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {searchError ? "Search Unavailable" : "No results found"}
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    {searchError
                      ? (searchError.includes("key") || searchError.includes("configured")
                        ? "Product search is not set up. Browse categories or deals below."
                        : searchError)
                      : "Try different keywords or change your country in settings"}
                  </Text>
                  <Pressable
                    onPress={handleClear}
                    style={[styles.emptyBtn, { backgroundColor: colors.primaryFaded }]}
                  >
                    <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Clear Search</Text>
                  </Pressable>
                </View>
              )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          <View style={styles.sectionContainer}>
            <View style={styles.sectionRow}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Searches</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularRow}
            >
              {POPULAR_SEARCHES.map((item, idx) => (
                <Pressable
                  key={`pop-${idx}`}
                  onPress={() => handlePopularSearch(item.label)}
                  style={[styles.popularChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                >
                  <Text style={styles.popularEmoji}>{item.emoji}</Text>
                  <Text style={[styles.popularLabel, { color: colors.text }]}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {recentlyViewed.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionRow}>
                <Eye size={16} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Viewed</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {recentlyViewed.map((item, index) => {
                  const displayPrice = format(item.price, item.currency);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() =>
                        router.push({ pathname: "/product-detail", params: { id: item.id } })
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
                        <Text style={[styles.trendingStore, { color: colors.textTertiary }]}>{item.store}</Text>
                        <Text style={[styles.trendingPrice, { color: colors.primary }]}>{displayPrice}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.sectionContainer}>
            <View style={styles.sectionRow}>
              <ArrowLeftRight size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Currency Converter</Text>
            </View>
            <View style={[styles.converterCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.converterRow}>
                <View style={styles.converterSide}>
                  <Pressable
                    onPress={() => {
                      const common = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
                      const idx = common.indexOf(convertFromCurrency);
                      setConvertFromCurrency(common[(idx + 1) % common.length]);
                    }}
                    style={styles.converterCurrencyToggle}
                  >
                    <Text style={[styles.converterLabel, { color: colors.textTertiary }]}>{convertFromCurrency}</Text>
                    <ArrowLeftRight size={12} color={colors.textTertiary} />
                  </Pressable>
                  <TextInput
                    value={convertAmount}
                    onChangeText={setConvertAmount}
                    placeholder="0"
                    keyboardType="numeric"
                    style={[styles.converterInputField, { color: colors.text }]}
                    placeholderTextColor={colors.textTertiary}
                    testID="currency-converter-input"
                  />
                </View>
                <ArrowRight size={20} color={colors.textTertiary} />
                <View style={[styles.converterSide, styles.converterOutput, { backgroundColor: colors.primaryFaded }]}>
                  <Text style={[styles.converterLabel, { color: colors.primary }]}>{currencyCode || "USD"}</Text>
                  <Text style={[styles.converterResult, { color: colors.primary }]}>
                    {convertedAmount ?? "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionRow}>
              <Zap size={16} color={colors.error} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Deals & Sales</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealCategoryRow}
            >
              {DEAL_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleDealCategoryPress(cat.id)}
                  style={[
                    styles.dealCategoryChip,
                    {
                      backgroundColor: selectedDealCategory === cat.id ? colors.primary : colors.surface,
                      borderColor: selectedDealCategory === cat.id ? colors.primary : colors.borderLight,
                    },
                  ]}
                >
                  <Text style={styles.dealCategoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.dealCategoryLabel,
                      { color: selectedDealCategory === cat.id ? "#FFFFFF" : colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {dealsMutation.isPending && (
              <View style={styles.dealsLoading}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={[styles.dealsLoadingText, { color: colors.textSecondary }]}>
                  Finding deals...
                </Text>
              </View>
            )}

            {dealResults.length > 0 && !dealsMutation.isPending && (
              <View style={styles.dealsGrid}>
                {dealResults.slice(0, 6).map((deal, idx) => {
                  const displayPrice = format(deal.price, deal.currency);
                  return (
                    <Pressable
                      key={`deal-${idx}`}
                      onPress={() =>
                        router.push({
                          pathname: "/product-detail",
                          params: { id: `deal_${idx}`, serpData: JSON.stringify(deal) },
                        })
                      }
                      style={[styles.dealCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                    >
                      {deal.image ? (
                        <Image source={{ uri: deal.image }} style={styles.dealImage} contentFit="cover" />
                      ) : (
                        <View style={[styles.dealImagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                          <Tag size={20} color={colors.textTertiary} />
                        </View>
                      )}
                      <View style={styles.dealInfo}>
                        <Text style={[styles.dealTitle, { color: colors.text }]} numberOfLines={2}>
                          {deal.title}
                        </Text>
                        <Text style={[styles.dealStore, { color: colors.textTertiary }]}>{deal.store}</Text>
                        <Text style={[styles.dealPrice, { color: colors.primary }]}>{displayPrice}</Text>
                      </View>
                      <View style={[styles.dealBadge, { backgroundColor: colors.error + "15" }]}>
                        <Flame size={10} color={colors.error} />
                        <Text style={[styles.dealBadgeText, { color: colors.error }]}>Deal</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionRow}>
              <ShoppingBag size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse Categories</Text>
            </View>
            <View style={styles.categoriesGrid}>
              {BROWSE_CATEGORIES.map((category) => (
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  alertBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    maxWidth: 150,
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  clearBtn: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  historyItemContent: {
    flex: 1,
    gap: 2,
  },
  historyQuery: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  historyMeta: {
    fontSize: 12,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  popularRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  popularChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  popularEmoji: {
    fontSize: 16,
  },
  popularLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
  },

  dealCategoryRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  dealCategoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  dealCategoryEmoji: {
    fontSize: 16,
  },
  dealCategoryLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  dealsLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  dealsLoadingText: {
    fontSize: 14,
  },
  dealsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  dealCard: {
    width: "47%" as unknown as number,
    flexBasis: "47%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  dealImage: {
    width: "100%",
    height: 100,
  },
  dealImagePlaceholder: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  dealInfo: {
    padding: 10,
    gap: 3,
  },
  dealTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    lineHeight: 17,
  },
  dealStore: {
    fontSize: 11,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: "800" as const,
    marginTop: 2,
  },
  dealBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  dealBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
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
    fontSize: 14,
    fontWeight: "600" as const,
  },
  trendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 14,
  },
  trendingBannerText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  trendingCard: {
    width: 160,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  trendingImage: {
    width: "100%",
    height: 120,
  },
  trendingInfo: {
    padding: 10,
    gap: 3,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    lineHeight: 17,
  },
  trendingStore: {
    fontSize: 11,
  },
  trendingBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  trendingPrice: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  searchResults: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
  },
  loadingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  skeletonCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  skeletonImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  resultSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  resultSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  resultSectionSub: {
    fontSize: 12,
    marginTop: 1,
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
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  resultImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resultInfo: {
    flex: 1,
    gap: 6,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 19,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  storeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  resultStore: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  resultBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultPrice: {
    fontSize: 17,
    fontWeight: "800" as const,
  },
  deliveryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resultDelivery: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  emptySearch: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 10,
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
    lineHeight: 20,
  },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  converterCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  converterRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  converterSide: {
    flex: 1,
    gap: 6,
  },
  converterLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  converterInputField: {
    fontSize: 26,
    fontWeight: "700" as const,
    padding: 0,
  },
  converterOutput: {
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start" as const,
  },
  converterResult: {
    fontSize: 24,
    fontWeight: "800" as const,
  },
  converterCurrencyToggle: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
});
