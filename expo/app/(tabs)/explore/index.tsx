import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X, TrendingUp } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { mockCategories } from "@/mocks/data";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";

export default function ExploreScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { allProducts, trendingProducts } = useWishlistContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = searchQuery.length > 0
    ? [...allProducts, ...trendingProducts].filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.store.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            placeholder="Search products, stores, categories..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {searchQuery.length > 0 ? (
        <ScrollView contentContainerStyle={styles.searchResults}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="horizontal"
                onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } })}
              />
            ))
          ) : (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Try searching with different keywords
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <SectionHeader title="Categories" />
          <View style={styles.categoriesGrid}>
            {mockCategories.map((category) => (
              <Pressable
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                <Text style={[styles.categoryCount, { color: colors.textTertiary }]}>
                  {category.productCount} items
                </Text>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Trending Now" />
          <View style={styles.trendingBanner}>
            <View style={[styles.trendingCard, { backgroundColor: colors.primaryFaded }]}>
              <TrendingUp size={20} color={colors.primary} />
              <Text style={[styles.trendingTitle, { color: colors.primary }]}>
                Most wishlisted this week
              </Text>
            </View>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />

          <SectionHeader title="Featured Products" />
          <View style={styles.featuredList}>
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="horizontal"
                onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } })}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryCard: {
    width: "47%" as unknown as number,
    flexBasis: "47%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  categoryCount: {
    fontSize: 12,
  },
  trendingBanner: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  trendingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  searchResults: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptySearch: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});
