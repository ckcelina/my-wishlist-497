import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Share2,
  Users,
  Check,
  Trash2,
  MessageCircle,
  Gift,
  Globe,
  Lock,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistById, useWishlistContext, useItemAssignments } from "@/providers/WishlistProvider";
import ProductCard from "@/components/ProductCard";

const appLogo = require("@/assets/images/logo.png");

export default function WishlistDetailScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const wishlist = useWishlistById(id ?? "");
  const { togglePurchased, removeProductFromWishlist, toggleShareWishlist, user } = useWishlistContext();
  const itemAssignments = useItemAssignments(id ?? "");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isOwner = wishlist?.collaborators.find((c) => c.id === user.id)?.role === "owner";

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
          <Text style={{ fontSize: 48 }}>{"📭"}</Text>
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

  const handleShare = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `Check out my wishlist "${wishlist.title}" on My Wishlist! ${wishlist.items.length} items waiting to be discovered.`,
        title: wishlist.title,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleToggleShared = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleShareWishlist(wishlist.id);
    if (!wishlist.isShared) {
      Alert.alert("List Shared!", "This wishlist is now visible to your collaborators. A group chat has been enabled.");
    } else {
      Alert.alert("List Unshared", "This wishlist is now private.");
    }
  };

  const handleOpenChat = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/wishlist-chat", params: { id: wishlist.id } });
  };

  const getItemAssignment = (productId: string) => {
    return itemAssignments.find((a) => a.productId === productId);
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
            {wishlist.isShared && (
              <Pressable onPress={handleOpenChat} style={[styles.iconBtn, { backgroundColor: colors.primaryFaded }]}>
                <MessageCircle size={18} color={colors.primary} />
              </Pressable>
            )}
            <Pressable onPress={handleShare} style={[styles.iconBtn, { backgroundColor: colors.surface }]}>
              <Share2 size={18} color={colors.text} />
            </Pressable>
            <Pressable onPress={handleToggleShared} style={[styles.iconBtn, { backgroundColor: wishlist.isShared ? colors.success + "20" : colors.surface }]}>
              {wishlist.isShared ? <Globe size={18} color={colors.success} /> : <Lock size={18} color={colors.textTertiary} />}
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

            {wishlist.isShared && (
              <Pressable onPress={handleOpenChat} style={[styles.chatBanner, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "25" }]}>
                <MessageCircle size={16} color={colors.primary} />
                <Text style={[styles.chatBannerText, { color: colors.primary }]}>
                  Open group chat to coordinate with {wishlist.collaborators.length - 1} collaborator{wishlist.collaborators.length > 2 ? "s" : ""}
                </Text>
              </Pressable>
            )}

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
              <Image source={appLogo} style={styles.emptyLogo} contentFit="contain" />
              <Text style={[styles.emptyItemsTitle, { color: colors.text }]}>No items yet</Text>
              <Text style={[styles.emptyItemsDesc, { color: colors.textSecondary }]}>
                Start adding products to this list
              </Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {wishlist.items.map((product) => {
                const assignment = getItemAssignment(product.id);
                return (
                  <View key={product.id}>
                    <View style={styles.itemRow}>
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
                    {assignment && (
                      <View style={[styles.assignmentIndicator, { backgroundColor: colors.success + "10" }]}>
                        <Gift size={12} color={colors.success} />
                        <Text style={[styles.assignmentIndicatorText, { color: colors.success }]}>
                          {isOwner ? "Someone has this covered \u{2728}" : `Claimed by ${assignment.assignedToName}`}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
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
  chatBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    width: "100%",
  },
  chatBannerText: {
    fontSize: 13,
    fontWeight: "600" as const,
    flex: 1,
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
  assignmentIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 8,
  },
  assignmentIndicatorText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
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
  emptyLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  emptyItemsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  emptyItemsDesc: {
    fontSize: 14,
  },
});
