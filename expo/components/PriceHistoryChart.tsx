import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { TrendingDown, TrendingUp, Minus } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { PriceHistoryEntry } from "@/providers/PriceAlertProvider";

interface PriceHistoryChartProps {
  entries: PriceHistoryEntry[];
  formatPrice: (amount: number, currency?: string) => string;
  currency: string;
}

export default function PriceHistoryChart({ entries, formatPrice, currency }: PriceHistoryChartProps) {
  const colors = useAppColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  const chartData = useMemo(() => {
    if (entries.length === 0) return null;

    const sorted = [...entries].sort(
      (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
    );

    const priceValues = sorted.map((e) => e.price).filter((p) => p > 0);
    if (priceValues.length === 0) return null;

    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const range = maxPrice - minPrice || 1;
    const avgPrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;

    const firstPrice = priceValues[0];
    const lastPrice = priceValues[priceValues.length - 1];
    const priceDiff = lastPrice - firstPrice;
    const percentChange = firstPrice > 0 ? ((priceDiff / firstPrice) * 100) : 0;
    const isDown = priceDiff < 0;
    const isFlat = Math.abs(priceDiff) < 0.01;

    return {
      sorted,
      minPrice,
      maxPrice,
      avgPrice,
      range,
      firstPrice,
      lastPrice,
      priceDiff,
      percentChange,
      isDown,
      isFlat,
    };
  }, [entries]);

  if (!chartData || chartData.sorted.length < 2) {
    if (entries.length === 1) {
      const entry = entries[0];
      return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.singleEntryContainer}>
            <View style={styles.singleEntryLeft}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Recorded Price</Text>
              <Text style={[styles.currentPrice, { color: colors.text }]}>
                {formatPrice(entry.price, currency)}
              </Text>
              <Text style={[styles.singleStore, { color: colors.textTertiary }]}>
                {entry.store} · {new Date(entry.checkedAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.trackingBadge, { backgroundColor: colors.primaryFaded }]}>
              <Text style={[styles.trackingText, { color: colors.primary }]}>Tracking</Text>
            </View>
          </View>
          <Text style={[styles.hintText, { color: colors.textTertiary }]}>
            Price history will build as we track this product over time
          </Text>
        </Animated.View>
      );
    }
    return null;
  }

  const { sorted, minPrice, maxPrice, avgPrice, range, isDown, isFlat, priceDiff, percentChange, lastPrice } = chartData;

  const BAR_COUNT = Math.min(sorted.length, 12);
  const displayEntries = sorted.slice(-BAR_COUNT);

  const trendColor = isFlat ? colors.textTertiary : isDown ? colors.success : colors.error;

  const TrendIcon = isFlat ? Minus : isDown ? TrendingDown : TrendingUp;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Latest Price</Text>
          <Text style={[styles.currentPrice, { color: colors.text }]}>
            {formatPrice(lastPrice, currency)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.trendBadge, { backgroundColor: trendColor + "15" }]}>
            <TrendIcon size={12} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {isFlat
                ? "Stable"
                : `${isDown ? "" : "+"}${percentChange.toFixed(1)}%`}
            </Text>
          </View>
          {!isFlat && (
            <Text style={[styles.diffText, { color: trendColor }]}>
              {isDown ? "↓" : "↑"} {formatPrice(Math.abs(priceDiff), currency)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.barChart}>
          {displayEntries.map((entry, idx) => {
            const normalizedHeight = range > 0 ? ((entry.price - minPrice) / range) * 100 : 50;
            const barHeight = Math.max(normalizedHeight, 6);
            const isLatest = idx === displayEntries.length - 1;
            const isLowest = Math.abs(entry.price - minPrice) < 0.01;
            const isHighest = Math.abs(entry.price - maxPrice) < 0.01;

            let barColor = colors.primary + "50";
            if (isLatest) barColor = colors.primary;
            else if (isLowest) barColor = colors.success + "80";
            else if (isHighest) barColor = colors.error + "60";

            const date = new Date(entry.checkedAt);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

            return (
              <View key={`bar-${idx}`} style={styles.barColumn}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${barHeight}%`,
                        backgroundColor: barColor,
                        borderRadius: isLatest ? 5 : 3,
                      },
                    ]}
                  />
                </View>
                {(idx === 0 || isLatest || idx === Math.floor(displayEntries.length / 2)) && (
                  <Text style={[styles.barLabel, { color: colors.textTertiary }]}>{dateStr}</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.priceAxis}>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
            {formatPrice(maxPrice, currency)}
          </Text>
          <View style={[styles.avgLine, { borderColor: colors.textTertiary + "30" }]} />
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
            {formatPrice(minPrice, currency)}
          </Text>
        </View>
      </View>

      <View style={[styles.statsRow, { backgroundColor: colors.surfaceSecondary, borderRadius: 12 }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Lowest</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {formatPrice(minPrice, currency)}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Average</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatPrice(avgPrice, currency)}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Highest</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {formatPrice(maxPrice, currency)}
          </Text>
        </View>
      </View>

      <Text style={[styles.footerText, { color: colors.textTertiary }]}>
        {entries.length} price check{entries.length !== 1 ? "s" : ""} recorded
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  headerLeft: {
    gap: 2,
  },
  headerRight: {
    alignItems: "flex-end" as const,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  trendBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  diffText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  chartArea: {
    flexDirection: "row" as const,
    gap: 8,
  },
  barChart: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    height: 130,
    gap: 3,
  },
  barColumn: {
    flex: 1,
    alignItems: "center" as const,
    gap: 4,
  },
  barContainer: {
    flex: 1,
    width: "100%" as const,
    justifyContent: "flex-end" as const,
  },
  bar: {
    width: "100%" as const,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 8,
    fontWeight: "500" as const,
  },
  priceAxis: {
    justifyContent: "space-between" as const,
    paddingBottom: 16,
    width: 60,
  },
  axisLabel: {
    fontSize: 9,
    fontWeight: "500" as const,
    textAlign: "right" as const,
  },
  avgLine: {
    borderTopWidth: 1,
    borderStyle: "dashed" as const,
    width: "100%" as const,
  },
  statsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  footerText: {
    fontSize: 10,
    textAlign: "center" as const,
  },
  singleEntryContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  singleEntryLeft: {
    gap: 2,
  },
  singleStore: {
    fontSize: 12,
    marginTop: 2,
  },
  trackingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  hintText: {
    fontSize: 11,
    textAlign: "center" as const,
    lineHeight: 16,
  },
});
