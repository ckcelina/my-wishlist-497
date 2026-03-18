import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { PriceHistoryEntry } from "@/providers/PriceAlertProvider";

interface PriceHistoryChartProps {
  entries: PriceHistoryEntry[];
  formatPrice: (amount: number, currency?: string) => string;
  currency: string;
}

export default function PriceHistoryChart({ entries, formatPrice, currency }: PriceHistoryChartProps) {
  const colors = useAppColors();

  const chartData = useMemo(() => {
    if (entries.length === 0) return null;

    const sorted = [...entries].sort(
      (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
    );

    const priceValues = sorted.map((e) => e.price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const range = maxPrice - minPrice || 1;

    const firstPrice = priceValues[0];
    const lastPrice = priceValues[priceValues.length - 1];
    const priceDiff = lastPrice - firstPrice;
    const isDown = priceDiff < 0;
    const isFlat = Math.abs(priceDiff) < 0.01;

    return {
      sorted,
      minPrice,
      maxPrice,
      range,
      firstPrice,
      lastPrice,
      priceDiff,
      isDown,
      isFlat,
    };
  }, [entries]);

  if (!chartData || chartData.sorted.length < 2) {
    return null;
  }

  const { sorted, minPrice, maxPrice, range, isDown, isFlat, priceDiff, lastPrice } = chartData;

  const BAR_COUNT = Math.min(sorted.length, 10);
  const displayEntries = sorted.slice(-BAR_COUNT);

  const trendColor = isFlat ? colors.textTertiary : isDown ? colors.success : colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Latest Price</Text>
          <Text style={[styles.currentPrice, { color: colors.text }]}>
            {formatPrice(lastPrice, currency)}
          </Text>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: trendColor + "15" }]}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {isFlat ? "Stable" : isDown ? `↓ ${formatPrice(Math.abs(priceDiff), currency)}` : `↑ ${formatPrice(Math.abs(priceDiff), currency)}`}
          </Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.barChart}>
          {displayEntries.map((entry, idx) => {
            const normalizedHeight = range > 0 ? ((entry.price - minPrice) / range) * 100 : 50;
            const barHeight = Math.max(normalizedHeight, 8);
            const isLatest = idx === displayEntries.length - 1;
            const barColor = isLatest ? colors.primary : colors.primary + "60";

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
                        borderRadius: 4,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textTertiary }]}>{dateStr}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.priceAxis}>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
            {formatPrice(maxPrice, currency)}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
            {formatPrice(minPrice, currency)}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Lowest</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {formatPrice(minPrice, currency)}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Highest</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {formatPrice(maxPrice, currency)}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Tracked</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {entries.length} check{entries.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
  },
  label: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  chartArea: {
    flexDirection: "row" as const,
    gap: 8,
  },
  barChart: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    height: 120,
    gap: 4,
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
    minHeight: 6,
  },
  barLabel: {
    fontSize: 8,
    fontWeight: "500" as const,
  },
  priceAxis: {
    justifyContent: "space-between" as const,
    paddingBottom: 16,
  },
  axisLabel: {
    fontSize: 9,
    fontWeight: "500" as const,
  },
  statsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
});
