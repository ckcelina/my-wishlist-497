import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
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
  ActivityIndicator,
  Modal,
  TextInput,
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
  RefreshCw,
  TrendingDown,
  PenLine,
  X,
  UserPlus,
  Mail,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useAppColors } from "@/hooks/useColorScheme";
import { useLocation } from "@/providers/LocationProvider";
import { useMutation } from "@tanstack/react-query";
import { checkPrices } from "@/lib/api";
import { useWishlistById, useWishlistContext, useItemAssignments } from "@/providers/WishlistProvider";
import ProductCard from "@/components/ProductCard";
import * as db from "@/lib/database";

export default function WishlistDetailScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const wishlist = useWishlistById(id ?? "");
  const { togglePurchased, removeProductFromWishlist, toggleShareWishlist, user, deleteWishlistById, updateProductInWishlist, refreshWishlists } = useWishlistContext();
  const itemAssignments = useItemAssignments(id ?? "");
  const { format, convert, currencyCode, serpApiCountryCode } = useLocation();

  const [showMenu, setShowMenu] = useState(false);
  const [priceDropMap, setPriceDropMap] = useState<Record<string, number>>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low' | undefined>(undefined);
  const [editNotes, setEditNotes] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isOwner = wishlist?.collaborators.find((c) => c.id === user.id)?.role === "owner";

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: showMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
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

  const totalValue = useMemo(() => {
    if (!wishlist) return 0;
    return wishlist.items
      .filter((i) => !i.isPurchased)
      .reduce((sum, item) => sum + convert(item.price, item.currency), 0);
  }, [wishlist, convert]);

  const batchRefreshMutation = useMutation({
    mutationFn: async () => {
      if (!wishlist || wishlist.items.length === 0) {
        return { results: [], error: "No items" };
      }
      const products = wishlist.items.slice(0, 5).map((item) => ({
        title: item.title,
        lastPrice: item.price,
        currency: item.currency,
        country: item.country || serpApiCountryCode || "us",
      }));
      return checkPrices(products);
    },
    onSuccess: (data) => {
      if (!data.results.length) return;
      const dropMap: Record<string, number> = {};
      data.results.forEach((result, idx) => {
        if (result.dropped && wishlist?.items[idx]) {
          dropMap[wishlist.items[idx].id] = result.savings ?? 0;
        }
      });
      setPriceDropMap(dropMap);
      const dropped = Object.keys(dropMap).length;
      Alert.alert(
        dropped > 0 ? "Price Drops Found! 🎉" : "Prices Stable",
        dropped > 0
          ? `${dropped} item${dropped > 1 ? "s have" : " has"} dropped in price!`
          : "All prices are stable right now."
      );
    },
  });

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

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const foundUser = await db.findUserByEmail(email.trim().toLowerCase());
      if (!foundUser) {
        throw new Error("No user found with that email. They need to sign up first.");
      }
      if (!wishlist) throw new Error("Wishlist not found");
      const alreadyCollab = wishlist.collaborators.some((c) => c.id === foundUser.id);
      if (alreadyCollab) {
        throw new Error("This user is already a collaborator.");
      }
      const success = await db.addCollaborator(
        wishlist.id,
        foundUser.id,
        foundUser.full_name,
        foundUser.avatar_url ?? "",
        "editor"
      );
      if (!success) throw new Error("Failed to add collaborator.");
      return foundUser;
    },
    onSuccess: (foundUser) => {
      Alert.alert("Invited!", `${foundUser.full_name} has been added as a collaborator.`);
      setInviteEmail("");
      setShowInviteModal(false);
      refreshWishlists();
    },
    onError: (err: Error) => {
      Alert.alert("Invite Failed", err.message);
    },
  });

  const handleEditItem = useCallback((productId: string) => {
    const item = wishlist?.items.find((i) => i.id === productId);
    if (!item) return;
    setEditingItem(productId);
    setEditPriority(item.priority);
    setEditNotes(item.notes ?? "");
  }, [wishlist]);

  const handleSaveItemEdit = useCallback(() => {
    if (!editingItem || !wishlist) return;
    updateProductInWishlist(wishlist.id, editingItem, {
      priority: editPriority,
      notes: editNotes.trim() || undefined,
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingItem(null);
  }, [editingItem, wishlist, editPriority, editNotes, updateProductInWishlist]);

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
      const itemLines = wishlist.items.slice(0, 5).map(
        (i) => `\u2022 ${i.title} \u2014 ${format(i.price, i.currency)} at ${i.store}`
      ).join("\n");
      const itemSummary = wishlist.items.length > 0
        ? `\n\n${itemLines}${wishlist.items.length > 5 ? `\n...and ${wishlist.items.length - 5} more items` : ""}`
        : "";
      const totalStr = totalValue > 0 ? `\nTotal: ${format(totalValue, currencyCode)}` : "";

      await Share.share({
        message: `${wishlist.emoji} ${wishlist.title}\n${wishlist.items.length} items${totalStr}${itemSummary}\n\n${shareLink}`,
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
              {totalValue > 0 && (
                <View style={[styles.metaBadge, { backgroundColor: colors.success + "20" }]}>
                  <Text style={[styles.metaBadgeText, { color: colors.success }]}>
                    {format(totalValue, currencyCode)}
                  </Text>
                </View>
              )}
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
            {wishlist.isShared && isOwner && (
              <Pressable
                onPress={() => { setShowMenu(false); setShowInviteModal(true); }}
                style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
              >
                <UserPlus size={16} color={themeColor} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Invite People</Text>
              </Pressable>
            )}
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
                <View style={styles.itemsHeaderRight}>
                  <Pressable
                    onPress={() => batchRefreshMutation.mutate()}
                    disabled={batchRefreshMutation.isPending}
                    style={[styles.refreshBtn, { backgroundColor: colors.primaryFaded }]}
                  >
                    {batchRefreshMutation.isPending
                      ? <ActivityIndicator size="small" color={colors.primary} />
                      : <RefreshCw size={12} color={colors.primary} />}
                    <Text style={[styles.refreshBtnText, { color: colors.primary }]}>Prices</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push("/(tabs)/add")}
                    style={[styles.addMoreBtn, { backgroundColor: themeColor + "12" }]}
                  >
                    <Plus size={14} color={themeColor} />
                    <Text style={[styles.addMoreText, { color: themeColor }]}>Add</Text>
                  </Pressable>
                </View>
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
                          onPress={() => handleEditItem(product.id)}
                          style={[styles.actionBtn, { backgroundColor: colors.primaryFaded }]}
                        >
                          <PenLine size={14} color={colors.primary} />
                        </Pressable>
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
                    {(product.priority || product.notes || priceDropMap[product.id] !== undefined) && (
                      <View style={styles.itemMetaRow}>
                        {product.priority ? (
                          <View style={[styles.priorityBadge, {
                            backgroundColor: product.priority === "high" ? "#FF4F4F20" : product.priority === "medium" ? "#FF8C0015" : "#00B89415"
                          }]}>
                            <Text style={[styles.priorityText, {
                              color: product.priority === "high" ? "#FF4F4F" : product.priority === "medium" ? "#FF8C00" : "#00B894"
                            }]}>
                              {product.priority === "high" ? "🔴 High" : product.priority === "medium" ? "🟡 Medium" : "🟢 Low"}
                            </Text>
                          </View>
                        ) : null}
                        {priceDropMap[product.id] !== undefined ? (
                          <View style={styles.priceDropBadge}>
                            <TrendingDown size={10} color="#00B894" />
                            <Text style={[styles.priceDropText, { color: "#00B894" }]}>Price dropped!</Text>
                          </View>
                        ) : null}
                        {product.notes ? (
                          <Text style={[styles.itemNotes, { color: colors.textTertiary }]} numberOfLines={1}>
                            📝 {product.notes}
                          </Text>
                        ) : null}
                      </View>
                    )}
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

      <Modal visible={editingItem !== null} transparent animationType="fade">
        <View style={styles.editModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditingItem(null)} />
          <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.text }]}>Edit Item</Text>
              <Pressable onPress={() => setEditingItem(null)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>

            <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {([undefined, 'low', 'medium', 'high'] as const).map((p) => {
                const isActive = editPriority === p;
                const label = p === undefined ? 'None' : p === 'high' ? '🔴 High' : p === 'medium' ? '🟡 Medium' : '🟢 Low';
                const activeColor = p === 'high' ? '#FF4F4F' : p === 'medium' ? '#FF8C00' : p === 'low' ? '#00B894' : colors.textSecondary;
                return (
                  <Pressable
                    key={p ?? 'none'}
                    onPress={() => setEditPriority(p)}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: isActive ? activeColor + '18' : colors.surfaceSecondary,
                        borderColor: isActive ? activeColor : colors.borderLight,
                      },
                    ]}
                  >
                    <Text style={[styles.priorityOptionText, { color: isActive ? activeColor : colors.text }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.editLabel, { color: colors.textSecondary, marginTop: 16 }]}>Notes</Text>
            <TextInput
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Add a note..."
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.editNotesInput,
                { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
              ]}
              multiline
              maxLength={300}
            />

            <View style={styles.editModalActions}>
              <Pressable
                onPress={() => setEditingItem(null)}
                style={[styles.editModalBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.editModalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveItemEdit}
                style={[styles.editModalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.editModalBtnText, { color: '#FFFFFF' }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showInviteModal} transparent animationType="slide">
        <View style={styles.editModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowInviteModal(false)} />
          <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.text }]}>Invite People</Text>
              <Pressable onPress={() => setShowInviteModal(false)}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>
            <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Email Address</Text>
            <View style={styles.inviteInputRow}>
              <Mail size={18} color={colors.textTertiary} />
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="friend@example.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.inviteInput,
                  { color: colors.text },
                ]}
              />
            </View>
            <Text style={[styles.inviteHint, { color: colors.textTertiary }]}>
              The person must have an account to be added as a collaborator.
            </Text>
            <View style={styles.editModalActions}>
              <Pressable
                onPress={() => { setShowInviteModal(false); setInviteEmail(""); }}
                style={[styles.editModalBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.editModalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => inviteMutation.mutate(inviteEmail)}
                disabled={!inviteEmail.trim() || inviteMutation.isPending}
                style={[
                  styles.editModalBtn,
                  {
                    backgroundColor: inviteEmail.trim() ? colors.primary : colors.surfaceSecondary,
                    opacity: inviteMutation.isPending ? 0.7 : 1,
                  },
                ]}
              >
                {inviteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.editModalBtnText, { color: inviteEmail.trim() ? '#FFFFFF' : colors.textTertiary }]}>Invite</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
      web: { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
    }),
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
  itemsHeaderRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  refreshBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  itemMetaRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    paddingLeft: 8,
    marginTop: 4,
    marginBottom: 2,
    alignItems: "center" as const,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  priceDropBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#00B89415",
  },
  priceDropText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  itemNotes: {
    fontSize: 11,
    flex: 1,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  editModalContent: {
    width: "88%" as unknown as number,
    borderRadius: 24,
    padding: 24,
  },
  editModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 8,
    marginLeft: 2,
  },
  priorityRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center" as const,
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  editNotesInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  editModalActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 20,
  },
  editModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center" as const,
  },
  editModalBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  inviteInputRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
  },
  inviteInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  inviteHint: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 2,
    lineHeight: 16,
  },
});
