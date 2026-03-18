import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  MapPin,
  Store,
  Share2,
  Check,
  Globe,
  TrendingDown,
  ShoppingBag,
  Bell,
  BellOff,
  ArrowLeftRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { useLocation } from "@/providers/LocationProvider";
import { usePriceAlerts, PriceHistoryEntry } from "@/providers/PriceAlertProvider";
import { mockProducts, trendingProducts } from "@/mocks/data";
import { Product } from "@/types";
import { comparePrices, getProductDetail, ProductSeller } from "@/lib/api";
import PriceHistoryChart from "@/components/PriceHistoryChart";

export default function ProductDetailScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, serpData } = useLocalSearchParams<{ id: string; serpData?: string }>();
  const { wishlists, addProductToWishlist } = useWishlistContext();
  const { country, serpApiCountryCode, format, convert, currencyCode, getCurrencySymbol } = useLocation();
  const { hasAlert, addAlert, removeAlert, getProductHistory, recordProductView, addPriceHistoryEntry } = usePriceAlerts();

  const [savedToList, setSavedToList] = useState<string | null>(null);
  const [sellers, setSellers] = useState<ProductSeller[]>([]);
  const [priceComparison, setPriceComparison] = useState<
    { country: string; results: { title: string; price: number; currency: string; store: string; link: string }[] }[]
  >([]);

  const allLocalProducts = [...mockProducts, ...trendingProducts];
  const wishlistItems = wishlists.flatMap((w) => w.items);

  let product: Product | undefined;
  let serpProductId: string | undefined;

  if (serpData) {
    try {
      const parsed = JSON.parse(serpData);
      serpProductId = parsed.productId;
      product = {
        id: id ?? `serp_${Date.now()}`,
        title: parsed.title || "Unknown Product",
        image: parsed.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        price: parsed.price || 0,
        currency: parsed.currency || "USD",
        store: parsed.store || "Unknown Store",
        storeUrl: parsed.link || "",
        description: parsed.snippet || "",
        category: "Search Result",
        isPurchased: false,
        addedAt: new Date().toISOString().split("T")[0],
        country: serpApiCountryCode.toUpperCase(),
        rating: parsed.rating,
      };
    } catch {
      console.log("[ProductDetail] Failed to parse serpData");
    }
  }

  if (!product) {
    product = allLocalProducts.find((p) => p.id === id) || wishlistItems.find((p) => p.id === id);
  }

  const productDetailMutation = useMutation({
    mutationFn: async (productIdParam: string) => {
      console.log("[ProductDetail] Fetching product detail for:", productIdParam);
      return getProductDetail(productIdParam, serpApiCountryCode);
    },
    onSuccess: (data) => {
      if (data.sellers && data.sellers.length > 0) {
        setSellers(data.sellers);
        console.log(`[ProductDetail] Found ${data.sellers.length} sellers`);
      }
    },
    onError: (err) => {
      console.log("[ProductDetail] Product detail fetch error:", err);
    },
  });

  const priceComparisonMutation = useMutation({
    mutationFn: async (query: string) => {
      console.log("[ProductDetail] Comparing prices for:", query);
      return comparePrices(query, [serpApiCountryCode, "us", "uk", "ae", "sa"]);
    },
    onSuccess: (data) => {
      if (data.comparison && data.comparison.length > 0) {
        setPriceComparison(data.comparison);
        console.log(`[ProductDetail] Price comparison across ${data.comparison.length} countries`);
      }
    },
    onError: (err) => {
      console.log("[ProductDetail] Price comparison error:", err);
    },
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (serpProductId) {
      productDetailMutation.mutate(serpProductId);
    }
    if (product?.title) {
      priceComparisonMutation.mutate(product.title);
    }
    if (product) {
      void recordProductView(
        product.id,
        product.title,
        product.price,
        product.currency,
        product.store,
        serpApiCountryCode
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priceAlertEnabled = product ? hasAlert(product.id) : false;
  const priceHistory = product ? getProductHistory(product.id) : [];

  useEffect(() => {
    if (sellers.length > 0 && product) {
      const now = new Date().toISOString();
      for (const seller of sellers.slice(0, 3)) {
        if (seller.price > 0) {
          void addPriceHistoryEntry(product.id, {
            productId: product.id,
            price: seller.price,
            currency: product.currency,
            store: seller.name,
            checkedAt: now,
          } as PriceHistoryEntry);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellers.length]);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Product not found</Text>
        </View>
      </View>
    );
  }

  const displayPrice = format(product.price, product.currency);
  const isConverted = product.currency !== currencyCode;
  const originalPrice = isConverted
    ? `${getCurrencySymbol(product.currency)}${product.price.toFixed(2)}`
    : null;

  const handleOpenStore = () => {
    if (product?.storeUrl) {
      void Linking.openURL(product.storeUrl);
    }
  };

  const handleSaveToWishlist = (listId: string) => {
    if (!product) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addProductToWishlist(listId, product);
    setSavedToList(listId);
    const listName = wishlists.find((w) => w.id === listId)?.title || "wishlist";
    Alert.alert("Saved!", `"${product.title}" added to ${listName}`);
  };

  const handleTogglePriceAlert = () => {
    if (!product) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!priceAlertEnabled) {
      void addAlert({
        productId: product.id,
        title: product.title,
        image: product.image,
        targetPrice: product.price * 0.9,
        currentPrice: product.price,
        currency: product.currency,
        store: product.store,
        storeUrl: product.storeUrl,
        country: serpApiCountryCode,
      });
      Alert.alert(
        "Price Alert Set",
        `We'll notify you when the price of "${product.title}" drops in ${country?.name ?? "your country"}.`
      );
    } else {
      void removeAlert(product.id);
      Alert.alert("Price Alert Removed", "You won't receive price drop notifications for this item.");
    }
  };

  const isInList = (listId: string) => {
    const list = wishlists.find((w) => w.id === listId);
    if (!list) return false;
    return list.items.some((item) => item.id === product?.id) || savedToList === listId;
  };

  const countryNames: Record<string, string> = {
    us: "United States", uk: "United Kingdom", ca: "Canada", au: "Australia",
    de: "Germany", fr: "France", jp: "Japan", in: "India", ae: "UAE",
    sa: "Saudi Arabia", eg: "Egypt", kw: "Kuwait", qa: "Qatar", bh: "Bahrain",
    om: "Oman", jo: "Jordan", lb: "Lebanon", sg: "Singapore", my: "Malaysia",
    th: "Thailand", kr: "South Korea", br: "Brazil", mx: "Mexico",
  };

  const countryFlags: Record<string, string> = {
    us: "🇺🇸", uk: "🇬🇧", ca: "🇨🇦", au: "🇦🇺", de: "🇩🇪", fr: "🇫🇷",
    jp: "🇯🇵", in: "🇮🇳", ae: "🇦🇪", sa: "🇸🇦", eg: "🇪🇬", kw: "🇰🇼",
    qa: "🇶🇦", bh: "🇧🇭", om: "🇴🇲", jo: "🇯🇴", lb: "🇱🇧", sg: "🇸🇬",
    my: "🇲🇾", th: "🇹🇭", kr: "🇰🇷", br: "🇧🇷", mx: "🇲🇽",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface + "E6" }]}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <View style={styles.topBarRight}>
          <Pressable
            onPress={handleTogglePriceAlert}
            style={[styles.iconBtn, { backgroundColor: priceAlertEnabled ? colors.primary : colors.surface + "E6" }]}
          >
            {priceAlertEnabled ? (
              <Bell size={18} color="#FFFFFF" />
            ) : (
              <BellOff size={18} color={colors.text} />
            )}
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.surface + "E6" }]}>
            <Share2 size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Image source={{ uri: product.image }} style={styles.productImage} contentFit="cover" />

          <View style={styles.content}>
            <View style={styles.categoryBadge}>
              <Text style={[styles.categoryText, { color: colors.primary, backgroundColor: colors.primaryFaded }]}>
                {product.category}
              </Text>
            </View>

            <Text style={[styles.productTitle, { color: colors.text }]}>{product.title}</Text>

            <View style={styles.metaRow}>
              {product.rating !== undefined && (
                <View style={styles.ratingRow}>
                  <Star size={16} color="#FFB300" fill="#FFB300" />
                  <Text style={[styles.rating, { color: colors.text }]}>{product.rating}</Text>
                </View>
              )}
              <View style={styles.storeRow}>
                <Store size={14} color={colors.textSecondary} />
                <Text style={[styles.storeName, { color: colors.textSecondary }]}>{product.store}</Text>
              </View>
              <View style={styles.storeRow}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={[styles.storeName, { color: colors.textSecondary }]}>
                  {country?.name ?? product.country}
                </Text>
              </View>
            </View>

            <View style={[styles.priceCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                  Price in {getCurrencySymbol(currencyCode)} {currencyCode}
                </Text>
                <Text style={[styles.priceValue, { color: colors.primary }]}>{displayPrice}</Text>
                {isConverted && originalPrice && (
                  <View style={styles.originalPriceRow}>
                    <ArrowLeftRight size={10} color={colors.textTertiary} />
                    <Text style={[styles.originalPrice, { color: colors.textTertiary }]}>
                      Originally {originalPrice} {product.currency}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.priceActions}>
                {product.storeUrl ? (
                  <Pressable onPress={handleOpenStore} style={[styles.visitBtn, { backgroundColor: colors.primary }]}>
                    <ExternalLink size={16} color="#FFFFFF" />
                    <Text style={styles.visitBtnText}>Visit Store</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={handleTogglePriceAlert}
              style={[
                styles.alertCard,
                {
                  backgroundColor: priceAlertEnabled ? colors.success + "12" : colors.surfaceSecondary,
                  borderColor: priceAlertEnabled ? colors.success + "40" : colors.borderLight,
                },
              ]}
            >
              <View style={[styles.alertIcon, { backgroundColor: priceAlertEnabled ? colors.success + "20" : colors.primaryFaded }]}>
                {priceAlertEnabled ? (
                  <Bell size={18} color={colors.success} />
                ) : (
                  <BellOff size={18} color={colors.primary} />
                )}
              </View>
              <View style={styles.alertInfo}>
                <Text style={[styles.alertTitle, { color: priceAlertEnabled ? colors.success : colors.text }]}>
                  {priceAlertEnabled ? "Price Alert Active" : "Set Price Alert"}
                </Text>
                <Text style={[styles.alertSub, { color: colors.textTertiary }]}>
                  {priceAlertEnabled
                    ? "We'll notify you when the price drops"
                    : "Get notified when this item goes on sale"}
                </Text>
              </View>
            </Pressable>

            {product.description ? (
              <View style={styles.descSection}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Description</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {product.description}
                </Text>
              </View>
            ) : null}

            {sellers.length > 0 && (
              <View style={styles.sellersSection}>
                <View style={styles.sectionHeaderRow}>
                  <ShoppingBag size={18} color={colors.primary} />
                  <Text style={[styles.sectionLabel, { color: colors.text, marginBottom: 0 }]}>
                    Online Sellers ({sellers.length})
                  </Text>
                </View>
                {sellers.slice(0, 8).map((seller, index) => {
                  const sellerPrice = seller.price > 0 ? format(seller.price, "USD") : seller.totalPrice || seller.basePrice;
                  return (
                    <Pressable
                      key={`seller-${index}`}
                      onPress={() => {
                        if (seller.link) void Linking.openURL(seller.link);
                      }}
                      style={[styles.sellerCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                    >
                      <View style={styles.sellerLeft}>
                        <Text style={[styles.sellerName, { color: colors.text }]}>{seller.name}</Text>
                        {seller.delivery ? (
                          <Text style={[styles.sellerDelivery, { color: colors.textTertiary }]}>
                            {seller.delivery}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.sellerRight}>
                        <Text style={[styles.sellerPrice, { color: colors.primary }]}>{sellerPrice}</Text>
                        <ExternalLink size={14} color={colors.textTertiary} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {productDetailMutation.isPending && (
              <View style={[styles.loadingCard, { backgroundColor: colors.primaryFaded }]}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={[styles.loadingText, { color: colors.primary }]}>Finding more sellers...</Text>
              </View>
            )}

            {product.alternatives && product.alternatives.length > 0 && (
              <View style={styles.alternativesSection}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Store Comparison</Text>
                {product.alternatives.map((alt, index) => {
                  const altPrice = format(alt.price, alt.currency);
                  return (
                    <View
                      key={`${alt.store}-${index}`}
                      style={[styles.altCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                    >
                      <View style={styles.altLeft}>
                        <Text style={[styles.altStore, { color: colors.text }]}>{alt.store}</Text>
                        <View style={styles.altMeta}>
                          <MapPin size={12} color={colors.textTertiary} />
                          <Text style={[styles.altCountry, { color: colors.textTertiary }]}>{alt.country}</Text>
                          {alt.shippingAvailable && (
                            <Text style={[styles.shippingBadge, { color: colors.success, backgroundColor: colors.success + "15" }]}>
                              Ships here
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text style={[styles.altPrice, { color: colors.primary }]}>{altPrice}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {priceComparison.length > 0 && (
              <View style={styles.comparisonSection}>
                <View style={styles.sectionHeaderRow}>
                  <Globe size={18} color={colors.primary} />
                  <Text style={[styles.sectionLabel, { color: colors.text, marginBottom: 0 }]}>
                    Price by Country (in {currencyCode})
                  </Text>
                </View>
                {priceComparison.map((countryData) => {
                  const bestResult = countryData.results[0];
                  if (!bestResult) return null;
                  const convertedPrice = format(bestResult.price, bestResult.currency);
                  const convertedOriginal = convert(product.price, product.currency);
                  const convertedBest = convert(bestResult.price, bestResult.currency);
                  const savings = convertedOriginal - convertedBest;

                  return (
                    <View
                      key={countryData.country}
                      style={[styles.countryCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                    >
                      <View style={styles.countryHeader}>
                        <Text style={styles.countryFlag}>
                          {countryFlags[countryData.country] || "🌍"}
                        </Text>
                        <View style={styles.countryInfo}>
                          <Text style={[styles.countryName, { color: colors.text }]}>
                            {countryNames[countryData.country] || countryData.country.toUpperCase()}
                          </Text>
                          <Text style={[styles.countryStore, { color: colors.textTertiary }]}>
                            {bestResult.store}
                          </Text>
                        </View>
                        <View style={styles.countryPriceCol}>
                          <Text style={[styles.countryPrice, { color: colors.primary }]}>
                            {convertedPrice}
                          </Text>
                          {savings > 1 && (
                            <View style={[styles.savingsBadge, { backgroundColor: colors.success + "15" }]}>
                              <TrendingDown size={10} color={colors.success} />
                              <Text style={[styles.savingsText, { color: colors.success }]}>
                                Save {format(savings, currencyCode)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {countryData.results.length > 1 && (
                        <View style={[styles.moreStores, { borderTopColor: colors.borderLight }]}>
                          {countryData.results.slice(1, 3).map((r, ri) => (
                            <View key={`more-${ri}`} style={styles.moreStoreRow}>
                              <Text style={[styles.moreStoreName, { color: colors.textSecondary }]}>{r.store}</Text>
                              <Text style={[styles.moreStorePrice, { color: colors.textSecondary }]}>
                                {format(r.price, r.currency)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {priceComparisonMutation.isPending && (
              <View style={[styles.loadingCard, { backgroundColor: colors.primaryFaded }]}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={[styles.loadingText, { color: colors.primary }]}>
                  Comparing prices worldwide...
                </Text>
              </View>
            )}

            {priceHistory.length > 0 && (
              <View style={styles.priceHistorySection}>
                <View style={styles.sectionHeaderRow}>
                  <TrendingDown size={18} color={colors.primary} />
                  <Text style={[styles.sectionLabel, { color: colors.text, marginBottom: 0 }]}>
                    Price History
                  </Text>
                </View>
                <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <PriceHistoryChart
                    entries={priceHistory}
                    formatPrice={format}
                    currency={product.currency}
                  />
                </View>
                <View style={[styles.historyList, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <Text style={[styles.historyListTitle, { color: colors.textSecondary }]}>Recent Checks</Text>
                  {priceHistory.slice(-5).reverse().map((entry, idx) => {
                    const entryPrice = format(entry.price, entry.currency);
                    const date = new Date(entry.checkedAt);
                    const dateStr = `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
                    const isFirst = idx === 0;
                    return (
                      <View
                        key={`history-${idx}`}
                        style={[styles.historyRow, { borderBottomColor: colors.borderLight }]}
                      >
                        {isFirst && <View style={[styles.historyDot, { backgroundColor: colors.primary }]} />}
                        {!isFirst && <View style={[styles.historyDot, { backgroundColor: colors.textTertiary + "40" }]} />}
                        <Text style={[styles.historyDate, { color: isFirst ? colors.text : colors.textTertiary }]}>{dateStr}</Text>
                        <Text style={[styles.historyStore, { color: colors.textSecondary }]} numberOfLines={1}>{entry.store}</Text>
                        <Text style={[styles.historyPrice, { color: isFirst ? colors.primary : colors.textSecondary }]}>{entryPrice}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.saveSection}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Save to Wishlist</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.saveChips}>
                  {wishlists.map((list) => {
                    const alreadyIn = isInList(list.id);
                    return (
                      <Pressable
                        key={list.id}
                        onPress={() => {
                          if (!alreadyIn) handleSaveToWishlist(list.id);
                        }}
                        style={[
                          styles.saveChip,
                          {
                            backgroundColor: alreadyIn ? colors.success + "15" : colors.surface,
                            borderColor: alreadyIn ? colors.success : colors.borderLight,
                          },
                        ]}
                      >
                        {alreadyIn ? (
                          <Check size={16} color={colors.success} />
                        ) : (
                          <Text style={{ fontSize: 18 }}>{list.emoji}</Text>
                        )}
                        <Text style={[styles.saveChipText, { color: alreadyIn ? colors.success : colors.text }]}>
                          {alreadyIn ? "Saved" : list.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  topBarRight: {
    flexDirection: "row" as const,
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  productImage: {
    width: "100%" as const,
    height: 320,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryBadge: {
    flexDirection: "row" as const,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden" as const,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    lineHeight: 30,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap" as const,
  },
  ratingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  storeRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  storeName: {
    fontSize: 13,
  },
  priceCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "800" as const,
  },
  originalPriceRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 12,
  },
  priceActions: {
    gap: 8,
  },
  visitBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  visitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  alertCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 24,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  alertInfo: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  alertSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  descSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  sellersSection: {
    marginBottom: 24,
  },
  sellerCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  sellerLeft: {
    flex: 1,
    gap: 3,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  sellerDelivery: {
    fontSize: 12,
  },
  sellerRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  sellerPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  loadingCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 14,
    gap: 12,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  alternativesSection: {
    marginBottom: 24,
  },
  altCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  altLeft: {
    gap: 4,
  },
  altStore: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  altMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  altCountry: {
    fontSize: 12,
  },
  shippingBadge: {
    fontSize: 11,
    fontWeight: "600" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden" as const,
  },
  altPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  comparisonSection: {
    marginBottom: 24,
  },
  countryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  countryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryInfo: {
    flex: 1,
    gap: 2,
  },
  countryName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  countryStore: {
    fontSize: 12,
  },
  countryPriceCol: {
    alignItems: "flex-end" as const,
    gap: 4,
  },
  countryPrice: {
    fontSize: 17,
    fontWeight: "700" as const,
  },
  savingsBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  moreStores: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  moreStoreRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  moreStoreName: {
    fontSize: 13,
  },
  moreStorePrice: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  saveSection: {
    marginBottom: 24,
  },
  saveChips: {
    flexDirection: "row" as const,
    gap: 10,
  },
  saveChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  saveChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  priceHistorySection: {
    marginBottom: 24,
  },
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  historyList: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  historyListTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  historyRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: "600" as const,
    width: 50,
  },
  historyStore: {
    fontSize: 13,
    flex: 1,
  },
  historyPrice: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
});
