import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Share2,
  Users,
  MoreHorizontal,
  Check,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistById, useWishlistContext } from "@/providers/WishlistProvider";
import ProductCard from "@/components/ProductCard";

export default function WishlistDetailScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const wishlist = useWishlistById(id ?? "");
  const { togglePurchased, removeProductFromWishlist } = useWishlistContext();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!wishlist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>List not found</Text>
        </View>
      </View>
    );
  }

  const handleTogglePurchased = (productId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePurchased(wishlist.id, productId);
  };

  const handleRemoveProduct = (productId: string, title: string) => {
    Alert.alert("Remove Item", `Remove "${title}" from this list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeProductFromWishlist(wishlist.id, productId);
        },
      },
    ]);
  };

  const purchasedCount = wishlist.items.filter((i) => i.isPurchased).length;
  const progress = wishlist.items.length > 0 ? purchasedCount / wishlist.items.length : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <View style={styles.topBarRight}>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.surface }]}>
              <Share2 size={18} color={colors.text} />
            </Pressable>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.surface }]}>
              <MoreHorizontal size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.heroSection}>
            <View style={[styles.bigEmoji, { backgroundColor: wishlist.color + "18" }]}>
              <Text style={styles.bigEmojiText}>{wishlist.emoji}</Text>
            </View>
            <Text style={[styles.listTitle, { color: colors.text }]}>{wishlist.title}</Text>
            {wishlist.description ? (
              <Text style={[styles.listDesc, { color: colors.textSecondary }]}>
                {wishlist.description}
              </Text>
            ) : null}

            {wishlist.collaborators.length > 1 && (
              <View style={styles.collaboratorsRow}>
                <Users size={14} color={colors.primary} />
                <View style={styles.avatarStack}>
                  {wishlist.collaborators.slice(0, 4).map((c, i) => (
                    <Image
                      key={c.id}
                      source={{ uri: c.avatar }}
                      style={[styles.collabAvatar, { marginLeft: i > 0 ? -8 : 0, borderColor: colors.background }]}
                    />
                  ))}
                </View>
                <Text style={[styles.collabText, { color: colors.textSecondary }]}>
                  {wishlist.collaborators.length} collaborators
                </Text>
              </View>
            )}

            {wishlist.items.length > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    {purchasedCount} of {wishlist.items.length} purchased
                  </Text>
                  <Text style={[styles.progressPercent, { color: colors.primary }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {wishlist.items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsEmoji}>🛒</Text>
              <Text style={[styles.emptyItemsTitle, { color: colors.text }]}>No items yet</Text>
              <Text style={[styles.emptyItemsDesc, { color: colors.textSecondary }]}>
                Start adding products to this list
              </Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {wishlist.items.map((product) => (
                <View key={product.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <ProductCard
                      product={product}
                      variant="horizontal"
                      onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id, wishlistId: wishlist.id } })}
                    />
                  </View>
                  <View style={styles.itemActions}>
                    <Pressable
                      onPress={() => handleTogglePurchased(product.id)}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: product.isPurchased ? colors.success + "20" : colors.surfaceSecondary,
                        },
                      ]}
                    >
                      <Check size={16} color={product.isPurchased ? colors.success : colors.textTertiary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveProduct(product.id, product.title)}
                      style={[styles.actionBtn, { backgroundColor: colors.error + "10" }]}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
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
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  bigEmoji: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  bigEmojiText: {
    fontSize: 36,
  },
  listTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    textAlign: "center" as const,
    marginBottom: 6,
  },
  listDesc: {
    fontSize: 15,
    textAlign: "center" as const,
    lineHeight: 21,
    marginBottom: 16,
  },
  collaboratorsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  collabAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  collabText: {
    fontSize: 13,
  },
  progressSection: {
    width: "100%",
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  itemsList: {
    paddingHorizontal: 20,
    gap: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemActions: {
    gap: 6,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  emptyItems: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyItemsEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyItemsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  emptyItemsDesc: {
    fontSize: 14,
  },
});
