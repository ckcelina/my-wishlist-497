import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Link2, PenLine, ShoppingBag, ChevronRight, Plus, Sparkles } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { Product } from "@/types";

export default function AddScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wishlists, addProductToWishlist } = useWishlistContext();

  const [mode, setMode] = useState<"menu" | "link" | "manual">("menu");
  const [productUrl, setProductUrl] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [description, setDescription] = useState("");
  const [selectedList, setSelectedList] = useState<string>("");

  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const scaleAnim3 = useRef(new Animated.Value(1)).current;

  const createPressHandlers = (anim: Animated.Value) => ({
    onPressIn: () => {
      Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
    },
    onPressOut: () => {
      Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    },
  });

  const handleAddFromLink = () => {
    if (!productUrl.trim()) {
      Alert.alert("Missing URL", "Please paste a product link.");
      return;
    }
    Alert.alert(
      "Coming Soon",
      "Automatic product detection from links will be available in a future update. Try manual entry for now!"
    );
  };

  const handleManualAdd = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a product title.");
      return;
    }
    if (!selectedList) {
      Alert.alert("Select a List", "Please choose a wishlist to add to.");
      return;
    }

    const newProduct: Product = {
      id: `manual_${Date.now()}`,
      title: title.trim(),
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      price: parseFloat(price) || 0,
      currency: "USD",
      store: store.trim() || "Unknown Store",
      storeUrl: "",
      description: description.trim(),
      category: "Other",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: "US",
    };

    addProductToWishlist(selectedList, newProduct);
    Alert.alert("Added!", `"${title}" has been added to your wishlist.`);
    setTitle("");
    setPrice("");
    setStore("");
    setDescription("");
    setSelectedList("");
    setMode("menu");
  };

  const handleCreateList = () => {
    router.push("/create-list");
  };

  if (mode === "link") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => setMode("menu")} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.formTitle, { color: colors.text }]}>Paste Product Link</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            We'll automatically detect the product details
          </Text>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Link2 size={18} color={colors.textTertiary} />
            <TextInput
              placeholder="https://store.com/product..."
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.text }]}
              value={productUrl}
              onChangeText={setProductUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <Pressable
            onPress={handleAddFromLink}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Detect Product</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (mode === "manual") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => setMode("menu")} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.formTitle, { color: colors.text }]}>Add Manually</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Product Title *</Text>
            <TextInput
              placeholder="e.g. Sony WH-1000XM5"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Price</Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Store</Text>
              <TextInput
                placeholder="e.g. Amazon"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={store}
                onChangeText={setStore}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
            <TextInput
              placeholder="Add some notes about this product..."
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.textInput,
                styles.textArea,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Add to Wishlist *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.listChips}>
                {wishlists.map((list) => (
                  <Pressable
                    key={list.id}
                    onPress={() => setSelectedList(list.id)}
                    style={[
                      styles.listChip,
                      {
                        backgroundColor: selectedList === list.id ? colors.primary : colors.surface,
                        borderColor: selectedList === list.id ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{list.emoji}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        { color: selectedList === list.id ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {list.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <Pressable
            onPress={handleManualAdd}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Add to Wishlist</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.menuContent, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>Add to Wishlist</Text>
        <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
          Choose how you'd like to add an item
        </Text>

        <View style={styles.menuCards}>
          <Pressable
            onPress={() => setMode("link")}
            {...createPressHandlers(scaleAnim1)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim1 }] },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.primaryFaded }]}>
                <Link2 size={28} color={colors.primary} />
              </View>
              <View style={styles.menuCardContent}>
                <Text style={[styles.menuCardTitle, { color: colors.text }]}>Paste Product Link</Text>
                <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>
                  Auto-detect product details from any URL
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={() => setMode("manual")}
            {...createPressHandlers(scaleAnim2)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim2 }] },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#E8F5E9" }]}>
                <PenLine size={28} color="#4CAF50" />
              </View>
              <View style={styles.menuCardContent}>
                <Text style={[styles.menuCardTitle, { color: colors.text }]}>Manual Entry</Text>
                <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>
                  Add product details yourself
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={handleCreateList}
            {...createPressHandlers(scaleAnim3)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim3 }] },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#FFF3E0" }]}>
                <ShoppingBag size={28} color="#FF9800" />
              </View>
              <View style={styles.menuCardContent}>
                <Text style={[styles.menuCardTitle, { color: colors.text }]}>Create New List</Text>
                <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>
                  Start a fresh wishlist collection
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Animated.View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 6,
  },
  menuSubtitle: {
    fontSize: 15,
    marginBottom: 28,
  },
  menuCards: {
    gap: 14,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  menuCardContent: {
    flex: 1,
    gap: 4,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  menuCardDesc: {
    fontSize: 13,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  formGroup: {
    marginBottom: 18,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  listChips: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 4,
  },
  listChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
