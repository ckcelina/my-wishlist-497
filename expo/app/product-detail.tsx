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
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { mockProducts, trendingProducts } from "@/mocks/data";
import { Product } from "@/types";

export default function ProductDetailScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, serpData } = useLocalSearchParams<{ id: string; serpData?: string }>();
  const { wishlists, addProductToWishlist } = useWishlistContext();

  const [savedToList, setSavedToList] = useState<string | null>(null);

  const allLocalProducts = [...mockProducts, ...trendingProducts];

  const wishlistItems = wishlists.flatMap((w) => w.items);

  let product: Product | undefined;

  if (serpData) {
    try {
      const parsed = JSON.parse(serpData);
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
        country: "US",
        rating: parsed.rating,
      };
    } catch {
      console.log("[ProductDetail] Failed to parse serpData");
    }
  }

  if (!product) {
    product = allLocalProducts.find((p) => p.id === id) || wishlistItems.find((p) => p.id === id);
  }

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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

  const isInList = (listId: string) => {
    const list = wishlists.find((w) => w.id === listId);
    if (!list) return false;
    return list.items.some((item) => item.id === product?.id) || savedToList === listId;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface + "E6" }]}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <View style={styles.topBarRight}>
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
                  <Text style={[styles.rating, { color: colors.text }]}>
                    {product.rating}
                  </Text>
                </View>
              )}
              <View style={styles.storeRow}>
                <Store size={14} color={colors.textSecondary} />
                <Text style={[styles.storeName, { color: colors.textSecondary }]}>{product.store}</Text>
              </View>
              <View style={styles.storeRow}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={[styles.storeName, { color: colors.textSecondary }]}>{product.country}</Text>
              </View>
            </View>

            <View style={[styles.priceCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Price</Text>
                <Text style={[styles.priceValue, { color: colors.primary }]}>
                  ${product.price.toFixed(2)}
                </Text>
              </View>
              {product.storeUrl ? (
                <Pressable
                  onPress={handleOpenStore}
                  style={[styles.visitBtn, { backgroundColor: colors.primary }]}
                >
                  <ExternalLink size={16} color="#FFFFFF" />
                  <Text style={styles.visitBtnText}>Visit Store</Text>
                </Pressable>
              ) : null}
            </View>

            {product.description ? (
              <View style={styles.descSection}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Description</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {product.description}
                </Text>
              </View>
            ) : null}

            {product.alternatives && product.alternatives.length > 0 && (
              <View style={styles.alternativesSection}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Store Comparison</Text>
                {product.alternatives.map((alt, index) => (
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
                    <Text style={[styles.altPrice, { color: colors.primary }]}>
                      {alt.currency === "GBP" ? "£" : "$"}{alt.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
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
                          if (!alreadyIn) {
                            handleSaveToWishlist(list.id);
                          }
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
                        <Text
                          style={[
                            styles.saveChipText,
                            { color: alreadyIn ? colors.success : colors.text },
                          ]}
                        >
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarRight: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 320,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryBadge: {
    flexDirection: "row",
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    lineHeight: 30,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storeName: {
    fontSize: 13,
  },
  priceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "800" as const,
  },
  visitBtn: {
    flexDirection: "row",
    alignItems: "center",
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
  descSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  alternativesSection: {
    marginBottom: 24,
  },
  altCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    overflow: "hidden",
  },
  altPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  saveSection: {
    marginBottom: 24,
  },
  saveChips: {
    flexDirection: "row",
    gap: 10,
  },
  saveChip: {
    flexDirection: "row",
    alignItems: "center",
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
