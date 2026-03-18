import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import {
  SlidersHorizontal,
  X,
  ArrowDownUp,
  DollarSign,
  Check,
  Truck,
  Store,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";

export type SortOption = "relevance" | "price_low_to_high" | "price_high_to_low" | "review_score";

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  sortBy: SortOption;
  freeDeliveryOnly?: boolean;
  storeFilter?: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  currencySymbol: string;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: "relevance", label: "Most Relevant", icon: "🎯" },
  { value: "price_low_to_high", label: "Price: Low → High", icon: "📉" },
  { value: "price_high_to_low", label: "Price: High → Low", icon: "📈" },
  { value: "review_score", label: "Best Rated", icon: "⭐" },
];

export default React.memo(function SearchFilters({
  filters,
  onApply,
  onReset,
  currencySymbol,
}: SearchFiltersProps) {
  const colors = useAppColors();
  const [showModal, setShowModal] = useState(false);
  const [localMin, setLocalMin] = useState(filters.minPrice?.toString() ?? "");
  const [localMax, setLocalMax] = useState(filters.maxPrice?.toString() ?? "");
  const [localSort, setLocalSort] = useState<SortOption>(filters.sortBy);
  const [localFreeDelivery, setLocalFreeDelivery] = useState(filters.freeDeliveryOnly ?? false);
  const [localStoreFilter, setLocalStoreFilter] = useState(filters.storeFilter ?? "");

  const hasActiveFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.sortBy !== "relevance" ||
    filters.freeDeliveryOnly === true ||
    !!filters.storeFilter;

  const activeCount = [
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.sortBy !== "relevance",
    filters.freeDeliveryOnly === true,
    !!filters.storeFilter,
  ].filter(Boolean).length;

  const handleOpen = useCallback(() => {
    setLocalMin(filters.minPrice?.toString() ?? "");
    setLocalMax(filters.maxPrice?.toString() ?? "");
    setLocalSort(filters.sortBy);
    setLocalFreeDelivery(filters.freeDeliveryOnly ?? false);
    setLocalStoreFilter(filters.storeFilter ?? "");
    setShowModal(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [filters]);

  const handleApply = useCallback(() => {
    const min = localMin ? parseFloat(localMin) : undefined;
    const max = localMax ? parseFloat(localMax) : undefined;
    onApply({
      minPrice: min,
      maxPrice: max,
      sortBy: localSort,
      freeDeliveryOnly: localFreeDelivery || undefined,
      storeFilter: localStoreFilter.trim() || undefined,
    });
    setShowModal(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [localMin, localMax, localSort, localFreeDelivery, localStoreFilter, onApply]);

  const handleReset = useCallback(() => {
    setLocalMin("");
    setLocalMax("");
    setLocalSort("relevance");
    setLocalFreeDelivery(false);
    setLocalStoreFilter("");
    onReset();
    setShowModal(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onReset]);

  return (
    <>
      <View style={styles.container}>
        <Pressable
          onPress={handleOpen}
          style={[
            styles.filterBtn,
            {
              backgroundColor: hasActiveFilters ? colors.primary : colors.surface,
              borderColor: hasActiveFilters ? colors.primary : colors.borderLight,
            },
          ]}
        >
          <SlidersHorizontal size={14} color={hasActiveFilters ? "#FFFFFF" : colors.text} />
          <Text
            style={[
              styles.filterBtnText,
              { color: hasActiveFilters ? "#FFFFFF" : colors.text },
            ]}
          >
            Filters
          </Text>
          {activeCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: "#FFFFFF" }]}>
              <Text style={[styles.filterBadgeText, { color: colors.primary }]}>
                {activeCount}
              </Text>
            </View>
          )}
        </Pressable>

        {SORT_OPTIONS.filter((o) => o.value !== "relevance").map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onApply({ ...filters, sortBy: opt.value });
            }}
            style={[
              styles.sortChip,
              {
                backgroundColor: filters.sortBy === opt.value ? colors.primaryFaded : colors.surface,
                borderColor: filters.sortBy === opt.value ? colors.primary : colors.borderLight,
              },
            ]}
          >
            <Text style={styles.sortChipIcon}>{opt.icon}</Text>
            <Text
              style={[
                styles.sortChipText,
                { color: filters.sortBy === opt.value ? colors.primary : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Search Filters
              </Text>
              <Pressable onPress={() => setShowModal(false)} hitSlop={8}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <DollarSign size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Price Range ({currencySymbol})
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <View style={[styles.priceInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
                    <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Min</Text>
                    <TextInput
                      value={localMin}
                      onChangeText={setLocalMin}
                      placeholder="0"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={[styles.priceField, { color: colors.text }]}
                      testID="filter-min-price"
                    />
                  </View>
                  <View style={[styles.priceDash, { backgroundColor: colors.border }]} />
                  <View style={[styles.priceInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
                    <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Max</Text>
                    <TextInput
                      value={localMax}
                      onChangeText={setLocalMax}
                      placeholder="Any"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={[styles.priceField, { color: colors.text }]}
                      testID="filter-max-price"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ArrowDownUp size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Sort By
                  </Text>
                </View>
                {SORT_OPTIONS.map((opt) => {
                  const isActive = localSort === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setLocalSort(opt.value)}
                      style={[
                        styles.sortOption,
                        {
                          backgroundColor: isActive ? colors.primaryFaded : "transparent",
                          borderColor: isActive ? colors.primary : colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={styles.sortOptionIcon}>{opt.icon}</Text>
                      <Text
                        style={[
                          styles.sortOptionLabel,
                          { color: isActive ? colors.primary : colors.text },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isActive && <Check size={18} color={colors.primary} />}
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Store size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Store Filter</Text>
                </View>
                <View style={[styles.storeInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
                  <TextInput
                    value={localStoreFilter}
                    onChangeText={setLocalStoreFilter}
                    placeholder="Filter by store name..."
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.storeInputField, { color: colors.text }]}
                    testID="filter-store"
                  />
                  {localStoreFilter.length > 0 && (
                    <Pressable onPress={() => setLocalStoreFilter("")} hitSlop={8}>
                      <X size={16} color={colors.textTertiary} />
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Truck size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery</Text>
                </View>
                <Pressable
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLocalFreeDelivery(!localFreeDelivery);
                  }}
                  style={[
                    styles.toggleRow,
                    {
                      backgroundColor: localFreeDelivery ? colors.primaryFaded : colors.surfaceSecondary,
                      borderColor: localFreeDelivery ? colors.primary : colors.borderLight,
                    },
                  ]}
                >
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>Free delivery only</Text>
                  <View style={[styles.toggleSwitch, { backgroundColor: localFreeDelivery ? colors.primary : colors.border }]}>
                    <View style={[styles.toggleKnob, { transform: [{ translateX: localFreeDelivery ? 18 : 2 }] }]} />
                  </View>
                </Pressable>
              </View>

            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={handleReset}
                style={[styles.resetBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>
                  Reset
                </Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  filterBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  sortChipIcon: {
    fontSize: 12,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  priceField: {
    fontSize: 18,
    fontWeight: "700" as const,
    padding: 0,
  },
  priceDash: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  sortOptionIcon: {
    fontSize: 18,
  },
  sortOptionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  applyBtn: {
    flex: 2,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  storeInput: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  storeInputField: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  toggleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  toggleSwitch: {
    width: 42,
    height: 24,
    borderRadius: 12,
    paddingVertical: 2,
    justifyContent: "center" as const,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    position: "absolute" as const,
  },
});
