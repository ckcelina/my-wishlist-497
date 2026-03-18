import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Trash2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Clock,
  Store,
  Zap,
  ExternalLink,
  BarChart3,
  Minus,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { usePriceAlerts, PriceAlert } from "@/providers/PriceAlertProvider";
import { useLocation } from "@/providers/LocationProvider";

function MiniPriceChart({ prices, colors }: { prices: number[]; colors: ReturnType<typeof useAppColors> }) {
  if (prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const lastFew = prices.slice(-8);
  const isDown = lastFew[lastFew.length - 1] < lastFew[0];
  const chartColor = isDown ? colors.success : colors.error;

  return (
    <View style={miniStyles.container}>
      {lastFew.map((price, idx) => {
        const normalized = ((price - min) / range) * 100;
        const height = Math.max(normalized, 4);
        const isLast = idx === lastFew.length - 1;
        return (
          <View key={`mini-${idx}`} style={miniStyles.barCol}>
            <View
              style={[
                miniStyles.bar,
                {
                  height: `${height}%`,
                  backgroundColor: isLast ? chartColor : chartColor + "50",
                  borderRadius: 2,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    height: 32,
    gap: 2,
    width: 60,
  },
  barCol: {
    flex: 1,
    justifyContent: "flex-end" as const,
    height: "100%" as const,
  },
  bar: {
    width: "100%" as const,
    minHeight: 2,
  },
});

export default function PriceAlertsScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    alerts,
    priceDrops,
    lastCheckTime,
    activeAlertCount,
    removeAlert,
    toggleAlert,
    checkPricesNow,
    isCheckingPrices,
    getProductHistory,
    clearAllDrops,
  } = usePriceAlerts();
  const { format } = useLocation();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  const handleRemoveAlert = useCallback(
    (alert: PriceAlert) => {
      Alert.alert(
        "Remove Alert",
        `Stop tracking "${alert.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              void removeAlert(alert.productId);
            },
          },
        ]
      );
    },
    [removeAlert]
  );

  const handleToggleAlert = useCallback(
    (alert: PriceAlert) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void toggleAlert(alert.productId);
    },
    [toggleAlert]
  );

  const handleCheckPrices = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    checkPricesNow();
  }, [checkPricesNow]);

  const handleRemoveAll = useCallback(() => {
    Alert.alert(
      "Remove All Alerts",
      "This will remove all price alerts. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove All",
          style: "destructive",
          onPress: () => {
            alerts.forEach((a) => void removeAlert(a.productId));
            clearAllDrops();
          },
        },
      ]
    );
  }, [alerts, removeAlert, clearAllDrops]);

  const formatLastCheck = (timestamp: string | null): string => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getDropForProduct = (productId: string) => {
    return priceDrops.find((d) => d.productId === productId);
  };

  const renderAlert = ({ item }: { item: PriceAlert }) => {
    const drop = getDropForProduct(item.productId);
    const targetPrice = format(item.targetPrice, item.currency);
    const currentPrice = format(item.currentPrice, item.currency);
    const history = getProductHistory(item.productId);
    const historyPrices = history.map((h) => h.price).filter((p) => p > 0);

    const priceTrend = historyPrices.length >= 2
      ? historyPrices[historyPrices.length - 1] < historyPrices[0]
        ? "down"
        : historyPrices[historyPrices.length - 1] > historyPrices[0]
          ? "up"
          : "flat"
      : "flat";

    const TrendIcon = priceTrend === "down" ? TrendingDown : priceTrend === "up" ? TrendingUp : Minus;
    const trendColor = priceTrend === "down" ? colors.success : priceTrend === "up" ? colors.error : colors.textTertiary;

    const timeSinceCreated = () => {
      const days = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (days === 0) return "Today";
      if (days === 1) return "1 day";
      return `${days} days`;
    };

    return (
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/product-detail",
            params: { id: item.productId },
          });
        }}
        style={[
          styles.alertCard,
          {
            backgroundColor: colors.surface,
            borderColor: item.isActive ? colors.borderLight : colors.border,
            opacity: item.isActive ? 1 : 0.6,
          },
        ]}
      >
        <View style={styles.alertRow}>
          <Image
            source={{ uri: item.image }}
            style={styles.alertImage}
            contentFit="cover"
          />
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.alertMeta}>
              <View style={[styles.storeTag, { backgroundColor: colors.surfaceSecondary }]}>
                <Store size={10} color={colors.textTertiary} />
                <Text style={[styles.storeText, { color: colors.textSecondary }]}>
                  {item.store}
                </Text>
              </View>
              <View style={[styles.trendTag, { backgroundColor: trendColor + "12" }]}>
                <TrendIcon size={10} color={trendColor} />
                <Text style={[styles.trendTagText, { color: trendColor }]}>
                  {priceTrend === "down" ? "Dropping" : priceTrend === "up" ? "Rising" : "Stable"}
                </Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceCol}>
                <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Current</Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>{currentPrice}</Text>
              </View>
              <View style={styles.priceArrow}>
                <TrendingDown size={14} color={colors.success} />
              </View>
              <View style={styles.priceCol}>
                <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Target</Text>
                <Text style={[styles.priceValue, { color: colors.success }]}>{targetPrice}</Text>
              </View>
              {historyPrices.length >= 2 && (
                <MiniPriceChart prices={historyPrices} colors={colors} />
              )}
            </View>

            {drop && (
              <Pressable
                onPress={() => {
                  if (drop.link) void Linking.openURL(drop.link);
                }}
                style={[styles.dropBanner, { backgroundColor: colors.success + "12" }]}
              >
                <Zap size={12} color={colors.success} />
                <Text style={[styles.dropText, { color: colors.success }]}>
                  Price dropped! Save {format(drop.savings, drop.currency)}
                </Text>
                {drop.link ? <ExternalLink size={12} color={colors.success} /> : null}
              </Pressable>
            )}
          </View>
        </View>

        <View style={[styles.alertFooter, { borderTopColor: colors.borderLight }]}>
          <View style={styles.footerLeft}>
            <View style={styles.footerStat}>
              <Clock size={10} color={colors.textTertiary} />
              <Text style={[styles.footerStatText, { color: colors.textTertiary }]}>
                Tracking {timeSinceCreated()}
              </Text>
            </View>
            {history.length > 0 && (
              <View style={styles.footerStat}>
                <BarChart3 size={10} color={colors.textTertiary} />
                <Text style={[styles.footerStatText, { color: colors.textTertiary }]}>
                  {history.length} check{history.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.alertActions}>
            <Pressable
              onPress={() => handleToggleAlert(item)}
              style={[styles.alertActionBtn, { backgroundColor: item.isActive ? colors.primaryFaded : colors.surfaceSecondary }]}
            >
              {item.isActive ? (
                <Bell size={14} color={colors.primary} />
              ) : (
                <BellOff size={14} color={colors.textTertiary} />
              )}
            </Pressable>
            <Pressable
              onPress={() => handleRemoveAlert(item)}
              style={[styles.alertActionBtn, { backgroundColor: colors.error + "10" }]}
            >
              <Trash2 size={14} color={colors.error} />
            </Pressable>
          </View>
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
            <Text style={[styles.screenTitle, { color: colors.text }]}>Price Alerts</Text>
            {activeAlertCount > 0 && (
              <View style={[styles.countBadge, { backgroundColor: colors.primaryFaded }]}>
                <Text style={[styles.countText, { color: colors.primary }]}>{activeAlertCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.topBarRight}>
            {alerts.length > 1 && (
              <Pressable
                onPress={handleRemoveAll}
                style={[styles.smallBtn, { backgroundColor: colors.error + "10" }]}
              >
                <Trash2 size={16} color={colors.error} />
              </Pressable>
            )}
            <Pressable
              onPress={handleCheckPrices}
              disabled={isCheckingPrices || alerts.length === 0}
              style={[
                styles.checkBtn,
                { backgroundColor: colors.primary, opacity: isCheckingPrices || alerts.length === 0 ? 0.5 : 1 },
              ]}
            >
              {isCheckingPrices ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <RefreshCw size={16} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>

        <View style={[styles.statusBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: activeAlertCount > 0 ? colors.success : colors.textTertiary }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {activeAlertCount} active alert{activeAlertCount !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Clock size={12} color={colors.textTertiary} />
            <Text style={[styles.statusText, { color: colors.textTertiary }]}>
              Last check: {formatLastCheck(lastCheckTime)}
            </Text>
          </View>
        </View>

        {isCheckingPrices && (
          <View style={[styles.checkingBanner, { backgroundColor: colors.primaryFaded }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.checkingText, { color: colors.primary }]}>
              Checking prices across stores...
            </Text>
          </View>
        )}

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryFaded }]}>
              <Bell size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No price alerts</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Set alerts on products to track prices and get notified when they drop
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/explore")}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.emptyBtnText}>Find Products</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.productId}
            renderItem={renderAlert}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
  topBarRight: {
    flexDirection: "row" as const,
    gap: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  smallBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  checkBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  statusBar: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  checkingBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  checkingText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  alertCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden" as const,
  },
  alertRow: {
    flexDirection: "row" as const,
    padding: 14,
    gap: 12,
  },
  alertImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  alertContent: {
    flex: 1,
    gap: 6,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 19,
  },
  alertMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    flexWrap: "wrap" as const,
  },
  storeTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  storeText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  trendTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  trendTagText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  priceRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  priceCol: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  priceArrow: {
    paddingTop: 10,
  },
  dropBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 2,
  },
  dropText: {
    fontSize: 12,
    fontWeight: "600" as const,
    flex: 1,
  },
  alertFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  footerLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  footerStat: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  footerStatText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  alertActions: {
    flexDirection: "row" as const,
    gap: 6,
  },
  alertActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center" as const,
    alignItems: "center" as const,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
