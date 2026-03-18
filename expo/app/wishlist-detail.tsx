import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Share2,
  Check,
  Trash2,
  MessageCircle,
  Gift,
  Globe,
  Lock,
  MoreVertical,
  Copy,
  Plus,
  ShoppingBag,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistById, useWishlistContext, useItemAssignments } from "@/providers/WishlistProvider";
import ProductCard from "@/components/ProductCard";

export default function WishlistDetailScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const wishlist = useWishlistById(id ?? "");
  const { togglePurchased, removeProductFromWishlist, toggleShareWishlist, user, deleteWishlistById } = useWishlistContext();
  const itemAssignments = useItemAssignments(id ?? "");

  const [showMenu, setShowMenu] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isOwner = wishlist?.collaborators.find((c) => c.id === user.id)?.role === "owner";

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: showMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMenu, menuAnim]);

  useEffect(() => {
    if (wishlist && wishlist.items.length > 0) {
      const purchased = wishlist.items.filter((i) => i.isPurchased).length;
      const target = purchased / wishlist.items.length;
      Animated.timing(progressAnim, {
        toValue: target,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [wishlist, progressAnim]);

  if (!wishlist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48 }}>{"📭"}</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>List not found</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            This wishlist may have been deleted
          </Text>
        </View>
      </View>
    );
  }

  const handleTogglePurchased = (productId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePurchased(wishlist.id, productId);
  };

  const handleRemoveProduct = (productId: string, productTitle: string) => {
    Alert.alert("Remove Item", `Remove "${productTitle}" from this list?`, [
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
      const shareLink = `mywishlist://list/${wishlist.id}`;
      const itemNames = wishlist.items.slice(0, 3).map((i) => i.title).join(", ");
      const itemSummary = wishlist.items.length > 0
        ? `\n\nItems: ${itemNames}${wishlist.items.length > 3 ? ` and ${wishlist.items.length - 3} more` : ""}`
        : "";

      await Share.share({
        message: `Check out my wishlist "${wishlist.title}"! ${wishlist.items.length} items.${itemSummary}\n\n${shareLink}`,
        title: wishlist.title,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareLink = `mywishlist://list/${wishlist.id}`;
      if (Platform.OS !== "web") {
        await Clipboard.setStringAsync(shareLink);
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Copied!", "Wishlist link copied to clipboard.");
    } catch (err) {
      console.log("Copy error:", err);
    }
  };

  const handleToggleShared = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleShareWishlist(wishlist.id);
    if (!wishlist.isShared) {
      Alert.alert(
        "List Shared!",
        "This wishlist is now visible to collaborators. Group chat enabled.",
        [
          { text: "OK" },
          { text: "Share Link", onPress: () => void handleShare() },
        ]
      );
    } else {
      Alert.alert("List Unshared", "This wishlist is now private.");
    }
  };

  const handleOpenChat = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/wishlist-chat", params: { id: wishlist.id } });
  };

  const handleDeleteWishlist = () => {
    Alert.alert(
      "Delete Wishlist",
      `Are you sure you want to delete "${wishlist.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteWishlistById(wishlist.id);
            router.back();
          },
        },
      ]
    );
  };

  const getItemAssignment = (productId: string) => {
    return itemAssignments.find((a) => a.productId === productId);
  };

  const purchasedCount = wishlist.items.filter((i) => i.isPurchased).length;
  const progress = wishlist.items.length > 0 ? purchasedCount / wishlist.items.length : 0;
  const themeColor = wishlist.color || colors.primary;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[styles.heroBackground, { backgroundColor: themeColor + "12" }]}>
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.background + "CC" }]}>
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <View style={styles.topBarRight}>
              {wishlist.isShared && (
                <Pressable onPress={handleOpenChat} style={[styles.iconBtn, { backgroundColor: themeColor + "20" }]}>
                  <MessageCircle size={18} color={themeColor} />
                </Pressable>
              )}
              <Pressable onPress={() => void handleShare()} style={[styles.iconBtn, { backgroundColor: colors.background + "CC" }]}>
                <Share2 size={18} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => setShowMenu(!showMenu)}
                style={[styles.iconBtn, { backgroundColor: colors.background + "CC" }]}
              >
                <MoreVertical size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={[styles.emojiCircle, { backgroundColor: themeColor + "25" }]}>
              <Text style={styles.heroEmoji}>{wishlist.emoji}</Text>
            </View>
            <Text style={[styles.listTitle, { color: colors.text }]}>{wishlist.title}</Text>
            {wishlist.description ? (
              <Text style={[styles.listDesc, { color: colors.textSecondary }]}>
                {wishlist.description}
              </Text>
            ) : null}

            <View style={styles.metaRow}>
              <View style={[styles.metaBadge, { backgroundColor: wishlist.isShared ? "#00B89420" : colors.surfaceSecondary }]}>
                {wishlist.isShared ? <Globe size={12} color="#00B894" /> : <Lock size={12} color={colors.textTertiary} />}
                <Text style={[styles.metaBadgeText, { color: wishlist.isShared ? "#00B894" : colors.textTertiary }]}>
                  {wishlist.isShared ? "Shared" : "Private"}
                </Text>
              </View>
              <View style={[styles.metaBadge, { backgroundColor: themeColor + "12" }]}>
                <ShoppingBag size={12} color={themeColor} />
                <Text style={[styles.metaBadgeText, { color: themeColor }]}>
                  {wishlist.items.length} {wishlist.items.length === 1 ? "item" : "items"}
                </Text>
              </View>
            </View>

            {wishlist.collaborators.length > 1 && (
              <View style={styles.collaboratorsRow}>
                <View style={styles.avatarStack}>
                  {wishlist.collaborators.slice(0, 4).map((c, i) => (
                    <Image
                      key={c.id}
                      source={c.avatar ? { uri: c.avatar } : require("@/assets/images/icon.png")}
                      style={[styles.collabAvatar, { marginLeft: i > 0 ? -10 : 0, borderColor: colors.background }]}
                    />
                  ))}
                </View>
                <Text style={[styles.collabText, { color: colors.textSecondary }]}>
                  {wishlist.collaborators.length} people
                </Text>
              </View>
            )}
          </View>
        </View>

        {showMenu && (
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowMenu(false)} />
        )}

        {showMenu && (
          <Animated.View
            style={[
              styles.menuDropdown,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
                opacity: menuAnim,
                right: 16,
                top: insets.top + 56,
              },
            ]}
          >
            <Pressable
              onPress={() => { setShowMenu(false); handleToggleShared(); }}
              style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            >
              {wishlist.isShared ? <Lock size={16} color={colors.text} /> : <Globe size={16} color={themeColor} />}
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {wishlist.isShared ? "Make Private" : "Share List"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { setShowMenu(false); void handleCopyLink(); }}
              style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            >
              <Copy size={16} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Copy Link</Text>
            </Pressable>
            {isOwner && (
              <Pressable
                onPress={() => { setShowMenu(false); handleDeleteWishlist(); }}
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
              >
                <Trash2 size={16} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Delete List</Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {wishlist.isShared && (
            <Pressable
              onPress={handleOpenChat}
              style={[styles.chatBanner, { backgroundColor: themeColor + "10", borderColor: themeColor + "25" }]}
            >
              <MessageCircle size={18} color={themeColor} />
              <Text style={[styles.chatBannerText, { color: themeColor }]}>
                Open group chat
              </Text>
              <Text style={[styles.chatBannerCount, { color: colors.textSecondary }]}>
                {wishlist.collaborators.length} members
              </Text>
            </Pressable>
          )}

          {wishlist.items.length > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  {purchasedCount} of {wishlist.items.length} purchased
                </Text>
                <Text style={[styles.progressPercent, { color: themeColor }]}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressWidth, backgroundColor: themeColor },
                  ]}
                />
              </View>
            </View>
          )}

          {wishlist.items.length === 0 ? (
            <View style={styles.emptyItems}>
              <View style={[styles.emptyIllustration, { backgroundColor: themeColor + "10" }]}>
                <Gift size={40} color={themeColor} />
              </View>
              <Text style={[styles.emptyItemsTitle, { color: colors.text }]}>No items yet</Text>
              <Text style={[styles.emptyItemsDesc, { color: colors.textSecondary }]}>
                Start adding products to this wishlist
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/add")}
                style={[styles.addItemBtn, { backgroundColor: themeColor }]}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addItemBtnText}>Add Items</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.itemsList}>
              <View style={styles.itemsHeader}>
                <Text style={[styles.itemsHeaderTitle, { color: colors.text }]}>Items</Text>
                <Pressable
                  onPress={() => router.push("/(tabs)/add")}
                  style={[styles.addMoreBtn, { backgroundColor: themeColor + "12" }]}
                >
                  <Plus size={14} color={themeColor} />
                  <Text style={[styles.addMoreText, { color: themeColor }]}>Add</Text>
                </Pressable>
              </View>

              {wishlist.items.map((product) => {
                const assignment = getItemAssignment(product.id);
                return (
                  <View key={product.id} style={styles.itemContainer}>
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
                              backgroundColor: product.isPurchased ? "#00B89420" : colors.surfaceSecondary,
                              borderColor: product.isPurchased ? "#00B89440" : "transparent",
                              borderWidth: 1,
                            },
                          ]}
                        >
                          <Check size={16} color={product.isPurchased ? "#00B894" : colors.textTertiary} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleRemoveProduct(product.id, product.title)}
                          style={[styles.actionBtn, { backgroundColor: colors.error + "10" }]}
                        >
                          <Trash2 size={14} color={colors.error} />
                        </Pressable>
                      </View>
                    </View>
                    {assignment && (
                      <View style={[styles.assignmentIndicator, { backgroundColor: "#00B89410" }]}>
                        <Gift size={12} color="#00B894" />
                        <Text style={[styles.assignmentText, { color: "#00B894" }]}>
                          {isOwner ? "Someone has this covered ✨" : `Claimed by ${assignment.assignedToName}`}
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
  heroBackground: {
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 20,
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
  heroContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 40,
  },
  listTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    textAlign: "center" as const,
    marginBottom: 6,
  },
  listDesc: {
    fontSize: 15,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  collaboratorsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  collabAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  },
  collabText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  menuDropdown: {
    position: "absolute",
    zIndex: 100,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 180,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  chatBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  chatBannerText: {
    fontSize: 14,
    fontWeight: "600" as const,
    flex: 1,
  },
  chatBannerCount: {
    fontSize: 12,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyItems: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyItemsTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  emptyItemsDesc: {
    fontSize: 14,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    marginTop: 8,
  },
  addItemBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  itemsList: {
    paddingHorizontal: 20,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  itemsHeaderTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addMoreText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  itemContainer: {
    marginBottom: 8,
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
    marginTop: 4,
    marginLeft: 8,
    marginBottom: 4,
  },
  assignmentText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center" as const,
  },
});
