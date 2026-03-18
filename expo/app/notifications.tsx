import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  Linking,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  TrendingDown,
  Share2,
  ShoppingBag,
  Settings,
  CheckCheck,
  Package,
  ExternalLink,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { usePriceAlerts } from "@/providers/PriceAlertProvider";
import { useLocation } from "@/providers/LocationProvider";

export default function NotificationsScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, markNotificationRead } = useWishlistContext();
  const { priceDrops, markDropAsRead, markAllDropsAsRead, clearAllDrops } = usePriceAlerts();
  const { format } = useLocation();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  type CombinedNotification = {
    id: string;
    type: "price_drop" | "notification";
    title: string;
    message: string;
    image?: string;
    timestamp: string;
    isRead: boolean;
    priceInfo?: {
      previousPrice: number;
      currentPrice: number;
      savings: number;
      currency: string;
      store: string;
      link: string;
    };
    notifType?: string;
  };

  const combinedNotifications: CombinedNotification[] = [
    ...priceDrops.map((d) => ({
      id: d.id,
      type: "price_drop" as const,
      title: d.title,
      message: `Price dropped at ${d.store}!`,
      image: d.image,
      timestamp: d.timestamp,
      isRead: d.isRead,
      priceInfo: {
        previousPrice: d.previousPrice,
        currentPrice: d.currentPrice,
        savings: d.savings,
        currency: d.currency,
        store: d.store,
        link: d.link,
      },
    })),
    ...notifications.map((n) => ({
      id: n.id,
      type: "notification" as const,
      title: n.title,
      message: n.message,
      image: n.image,
      timestamp: n.timestamp,
      isRead: n.isRead,
      notifType: n.type,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleMarkRead = useCallback(
    (item: CombinedNotification) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (item.type === "price_drop") {
        markDropAsRead(item.id);
      } else {
        markNotificationRead(item.id);
      }
    },
    [markDropAsRead, markNotificationRead]
  );

  const handleMarkAllRead = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllDropsAsRead();
    notifications.filter((n) => !n.isRead).forEach((n) => markNotificationRead(n.id));
  }, [notifications, markAllDropsAsRead, markNotificationRead]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            clearAllDrops();
          },
        },
      ]
    );
  }, [clearAllDrops]);

  const handleVisitStore = useCallback((link: string) => {
    if (link) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void Linking.openURL(link);
    }
  }, []);

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "price_drop":
        return <TrendingDown size={16} color={colors.success} />;
      case "shared_list":
        return <Share2 size={16} color={colors.primary} />;
      case "product_update":
        return <Package size={16} color={colors.warning} />;
      default:
        return <Bell size={16} color={colors.primary} />;
    }
  };

  const unreadTotal = combinedNotifications.filter((n) => !n.isRead).length;

  const renderNotification = ({ item }: { item: CombinedNotification }) => {
    return (
      <Pressable
        onPress={() => handleMarkRead(item)}
        style={[
          styles.notifCard,
          {
            backgroundColor: item.isRead ? colors.surface : colors.primaryFaded,
            borderColor: item.isRead ? colors.borderLight : colors.primary + "30",
          },
        ]}
      >
        <View style={styles.notifRow}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.notifImage} contentFit="cover" />
          ) : (
            <View style={[styles.notifIconWrap, { backgroundColor: colors.primaryFaded }]}>
              {getNotificationIcon(item.type)}
            </View>
          )}

          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.notifTime, { color: colors.textTertiary }]}>
                {formatTimeAgo(item.timestamp)}
              </Text>
            </View>
            <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.message}
            </Text>

            {item.priceInfo && (
              <View style={styles.priceDropSection}>
                <View style={styles.priceDropRow}>
                  <View style={styles.priceComparison}>
                    <Text style={[styles.oldPrice, { color: colors.textTertiary }]}>
                      {format(item.priceInfo.previousPrice, item.priceInfo.currency)}
                    </Text>
                    <Text style={[styles.newPrice, { color: colors.success }]}>
                      {format(item.priceInfo.currentPrice, item.priceInfo.currency)}
                    </Text>
                  </View>
                  <View style={[styles.savingsPill, { backgroundColor: colors.success + "15" }]}>
                    <TrendingDown size={10} color={colors.success} />
                    <Text style={[styles.savingsText, { color: colors.success }]}>
                      Save {format(item.priceInfo.savings, item.priceInfo.currency)}
                    </Text>
                  </View>
                </View>

                {item.priceInfo.link ? (
                  <Pressable
                    onPress={() => handleVisitStore(item.priceInfo?.link ?? "")}
                    style={[styles.visitStoreBtn, { backgroundColor: colors.primary }]}
                  >
                    <ExternalLink size={13} color="#FFFFFF" />
                    <Text style={styles.visitStoreBtnText}>
                      Buy at {item.priceInfo.store}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>

          {!item.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Notifications</Text>
            {unreadTotal > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadBadgeText}>{unreadTotal}</Text>
              </View>
            )}
          </View>
          <View style={styles.topBarActions}>
            {unreadTotal > 0 && (
              <Pressable onPress={handleMarkAllRead} style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
                <CheckCheck size={18} color={colors.primary} />
              </Pressable>
            )}
            {combinedNotifications.length > 0 && (
              <Pressable onPress={handleClearAll} style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
                <Trash2 size={18} color={colors.error} />
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push("/price-alerts" as never)}
              style={[styles.actionBtn, { backgroundColor: colors.surface }]}
            >
              <Settings size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {priceDrops.length > 0 && (
          <View style={[styles.summaryBar, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
            <TrendingDown size={16} color={colors.success} />
            <Text style={[styles.summaryText, { color: colors.success }]}>
              {priceDrops.filter((d) => !d.isRead).length} new price drop{priceDrops.filter((d) => !d.isRead).length !== 1 ? "s" : ""} detected
            </Text>
            <Pressable
              onPress={() => router.push("/price-alerts" as never)}
              style={[styles.summaryBtn, { backgroundColor: colors.success + "20" }]}
            >
              <Text style={[styles.summaryBtnText, { color: colors.success }]}>Manage</Text>
            </Pressable>
          </View>
        )}

        {combinedNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryFaded }]}>
              <Bell size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Set price alerts on products to get notified when prices drop
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/explore")}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <ShoppingBag size={16} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Explore Products</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={combinedNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  topBarCenter: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  topBarActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  summaryBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  summaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  summaryBtnText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  notifCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  notifRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  notifImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  notifIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  priceDropSection: {
    marginTop: 8,
    gap: 8,
  },
  priceDropRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  priceComparison: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  oldPrice: {
    fontSize: 13,
    fontWeight: "500" as const,
    textDecorationLine: "line-through" as const,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: "800" as const,
  },
  savingsPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  visitStoreBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  visitStoreBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
