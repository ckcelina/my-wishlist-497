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
  ActivityIndicator,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Link2,
  PenLine,
  Camera,
  ChevronRight,
  Plus,
  Sparkles,
  ImagePlus,
  Search,
  X,
  Check,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { Product } from "@/types";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { searchProducts, scrapeProductUrl, SerpApiResult } from "@/lib/api";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().describe("Product name/title detected from the image"),
  description: z.string().describe("Brief product description"),
  category: z.string().describe("Product category like Electronics, Fashion, Home, Beauty, etc."),
  estimatedPrice: z.number().optional().describe("Estimated price if visible"),
  brand: z.string().optional().describe("Brand name if identifiable"),
  searchQuery: z.string().describe("Best search query to find this product online"),
});

type DetectedProduct = z.infer<typeof productSchema>;

export default function AddScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { wishlists, addProductToWishlist } = useWishlistContext();
  const hasWishlists = wishlists.length > 0;

  const [mode, setMode] = useState<"menu" | "link" | "manual" | "image">("menu");
  const [productUrl, setProductUrl] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [description, setDescription] = useState("");
  const [selectedList, setSelectedList] = useState<string>("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<DetectedProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SerpApiResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SerpApiResult | null>(null);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [scrapedData, setScrapedData] = useState<{ title: string; image: string; description: string; price: number; store: string } | null>(null);
  const [linkSearchResults, setLinkSearchResults] = useState<SerpApiResult[]>([]);
  const [selectedLinkResult, setSelectedLinkResult] = useState<SerpApiResult | null>(null);
  const [linkSelectedList, setLinkSelectedList] = useState<string>("");

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

  const resetImageState = () => {
    setSelectedImage(null);
    setDetectedProduct(null);
    setSearchResults([]);
    setSelectedResult(null);
    setIsDetecting(false);
    setIsSearching(false);
    setSelectedList("");
  };

  const handlePickImage = async () => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert("Permission Needed", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
        allowsEditing: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      setDetectedProduct(null);
      setSearchResults([]);
      setSelectedResult(null);

      if (asset.base64) {
        await detectProductFromImage(asset.base64, asset.mimeType || "image/jpeg");
      } else {
        Alert.alert("Error", "Could not read image data. Please try again.");
      }
    } catch (err) {
      console.error("[ImagePicker] Error:", err);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert("Permission Needed", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
        allowsEditing: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      setDetectedProduct(null);
      setSearchResults([]);
      setSelectedResult(null);

      if (asset.base64) {
        await detectProductFromImage(asset.base64, asset.mimeType || "image/jpeg");
      }
    } catch (err) {
      console.error("[Camera] Error:", err);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  const detectProductFromImage = async (base64: string, mimeType: string) => {
    setIsDetecting(true);
    try {
      console.log("[AI] Detecting product from image...");
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const detected = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this product image. Identify the product name, description, category, estimated price if visible, brand if identifiable, and a good search query to find this product on shopping sites.",
              },
              {
                type: "image",
                image: `data:${mimeType};base64,${base64}`,
              },
            ],
          },
        ],
        schema: productSchema,
      });

      console.log("[AI] Detected product:", JSON.stringify(detected));
      setDetectedProduct(detected);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await searchForProduct(detected.searchQuery);
    } catch (err) {
      console.error("[AI] Detection failed:", err);
      Alert.alert("Detection Failed", "Could not identify the product. Try manual entry instead.");
    } finally {
      setIsDetecting(false);
    }
  };

  const searchForProduct = async (query: string) => {
    setIsSearching(true);
    try {
      console.log("[Search] Searching for:", query);
      const { results, error } = await searchProducts(query);

      if (error) {
        console.log("[Search] Error:", error);
      }

      setSearchResults(results);
      console.log(`[Search] Got ${results.length} results`);
    } catch (err) {
      console.error("[Search] Failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddDetectedProduct = () => {
    if (!selectedList) {
      Alert.alert("Select a List", "Please choose a wishlist to add to.");
      return;
    }

    const productTitle = selectedResult?.title || detectedProduct?.title || "Unknown Product";
    const productPrice = selectedResult?.price || detectedProduct?.estimatedPrice || 0;
    const productStore = selectedResult?.store || "Unknown Store";
    const productImage = selectedResult?.image || selectedImage || "";
    const productDesc = detectedProduct?.description || selectedResult?.snippet || "";

    const newProduct: Product = {
      id: `img_${Date.now()}`,
      title: productTitle,
      image: productImage,
      price: productPrice,
      currency: selectedResult?.currency || "USD",
      store: productStore,
      storeUrl: selectedResult?.link || "",
      description: productDesc,
      category: detectedProduct?.category || "Other",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: "US",
      rating: selectedResult?.rating,
    };

    addProductToWishlist(selectedList, newProduct);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Added!", `"${productTitle}" has been added to your wishlist.`);
    resetImageState();
    setMode("menu");
  };

  const resetLinkState = () => {
    setProductUrl("");
    setScrapedData(null);
    setLinkSearchResults([]);
    setSelectedLinkResult(null);
    setLinkSelectedList("");
    setIsScrapingUrl(false);
  };

  const handleAddFromLink = async () => {
    if (!productUrl.trim()) {
      Alert.alert("Missing URL", "Please paste a product link.");
      return;
    }

    setIsScrapingUrl(true);
    setScrapedData(null);
    setLinkSearchResults([]);
    setSelectedLinkResult(null);

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await scrapeProductUrl(productUrl.trim());

      if (result.error && !result.title) {
        Alert.alert("Scrape Failed", result.error);
        setIsScrapingUrl(false);
        return;
      }

      setScrapedData({
        title: result.title,
        image: result.image,
        description: result.description,
        price: result.price,
        store: result.store,
      });

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result.title) {
        console.log("[Link] Searching for scraped product:", result.title);
        const { results } = await searchProducts(result.title);
        setLinkSearchResults(results);
      }
    } catch (err) {
      console.error("[Link] Scrape error:", err);
      Alert.alert("Error", "Failed to detect product from URL.");
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleAddFromLinkResult = () => {
    if (!linkSelectedList) {
      Alert.alert("Select a List", "Please choose a wishlist to add to.");
      return;
    }

    const productTitle = selectedLinkResult?.title || scrapedData?.title || "Product from Link";
    const productPrice = selectedLinkResult?.price || scrapedData?.price || 0;
    const productStore = selectedLinkResult?.store || scrapedData?.store || "Unknown Store";
    const productImage = selectedLinkResult?.image || scrapedData?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";
    const productDesc = scrapedData?.description || selectedLinkResult?.snippet || "";

    const newProduct: Product = {
      id: `link_${Date.now()}`,
      title: productTitle,
      image: productImage,
      price: productPrice,
      currency: selectedLinkResult?.currency || "USD",
      store: productStore,
      storeUrl: selectedLinkResult?.link || productUrl,
      description: productDesc,
      category: "Other",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: "US",
      rating: selectedLinkResult?.rating,
    };

    addProductToWishlist(linkSelectedList, newProduct);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Added!", `"${productTitle}" has been added to your wishlist.`);
    resetLinkState();
    setMode("menu");
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
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Added!", `"${title}" has been added to your wishlist.`);
    setTitle("");
    setPrice("");
    setStore("");
    setDescription("");
    setSelectedList("");
    setMode("menu");
  };

  if (mode === "image") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => { resetImageState(); setMode("menu"); }} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.formTitle, { color: colors.text }]}>Scan Product</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            Upload or take a photo to auto-detect
          </Text>

          {!selectedImage ? (
            <View style={styles.imagePickerArea}>
              <Pressable
                onPress={handlePickImage}
                style={[styles.imagePickerCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "30" }]}
              >
                <ImagePlus size={32} color={colors.primary} />
                <Text style={[styles.imagePickerLabel, { color: colors.text }]}>Upload Photo</Text>
                <Text style={[styles.imagePickerHint, { color: colors.textSecondary }]}>
                  From gallery
                </Text>
              </Pressable>

              {Platform.OS !== "web" && (
                <Pressable
                  onPress={handleTakePhoto}
                  style={[styles.imagePickerCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "30" }]}
                >
                  <Camera size={32} color={colors.primary} />
                  <Text style={[styles.imagePickerLabel, { color: colors.text }]}>Take Photo</Text>
                  <Text style={[styles.imagePickerHint, { color: colors.textSecondary }]}>
                    Use camera
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.detectionArea}>
              <View style={styles.imagePreviewRow}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} contentFit="cover" />
                <Pressable
                  onPress={resetImageState}
                  style={[styles.removeImageBtn, { backgroundColor: colors.error + "20" }]}
                >
                  <X size={16} color={colors.error} />
                </Pressable>
              </View>

              {isDetecting && (
                <View style={[styles.statusCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.statusText, { color: colors.primary }]}>
                    Analyzing product with AI...
                  </Text>
                </View>
              )}

              {detectedProduct && !isDetecting && (
                <View style={[styles.detectedCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.detectedHeader}>
                    <Sparkles size={18} color={colors.primary} />
                    <Text style={[styles.detectedTitle, { color: colors.primary }]}>Product Detected</Text>
                  </View>
                  <Text style={[styles.detectedName, { color: colors.text }]}>{detectedProduct.title}</Text>
                  {detectedProduct.brand && (
                    <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>
                      Brand: {detectedProduct.brand}
                    </Text>
                  )}
                  <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>
                    Category: {detectedProduct.category}
                  </Text>
                  {detectedProduct.estimatedPrice !== undefined && detectedProduct.estimatedPrice > 0 && (
                    <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>
                      Est. Price: ${detectedProduct.estimatedPrice.toFixed(2)}
                    </Text>
                  )}
                  <Text style={[styles.detectedDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {detectedProduct.description}
                  </Text>
                </View>
              )}

              {isSearching && (
                <View style={[styles.statusCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.statusText, { color: colors.primary }]}>
                    Searching stores...
                  </Text>
                </View>
              )}

              {searchResults.length > 0 && !isSearching && (
                <View style={styles.resultsSection}>
                  <View style={styles.resultsSectionHeader}>
                    <Search size={16} color={colors.textSecondary} />
                    <Text style={[styles.resultsSectionTitle, { color: colors.text }]}>
                      Found in Stores ({searchResults.length})
                    </Text>
                  </View>
                  {searchResults.map((result, idx) => (
                    <Pressable
                      key={`result-${idx}`}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedResult(selectedResult === result ? null : result);
                      }}
                      style={[
                        styles.resultCard,
                        {
                          backgroundColor: selectedResult === result ? colors.primaryFaded : colors.surface,
                          borderColor: selectedResult === result ? colors.primary : colors.borderLight,
                        },
                      ]}
                    >
                      {result.image ? (
                        <Image source={{ uri: result.image }} style={styles.resultImage} contentFit="cover" />
                      ) : (
                        <View style={[styles.resultImagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                          <Search size={16} color={colors.textTertiary} />
                        </View>
                      )}
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
                          {result.title}
                        </Text>
                        <View style={styles.resultMeta}>
                          <Text style={[styles.resultPrice, { color: colors.primary }]}>
                            {result.price > 0 ? `$${result.price.toFixed(2)}` : "Price N/A"}
                          </Text>
                          <Text style={[styles.resultStore, { color: colors.textSecondary }]}>
                            {result.store}
                          </Text>
                        </View>
                      </View>
                      {selectedResult === result && (
                        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                          <Check size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {detectedProduct && !isDetecting && !isSearching && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>ADD TO WISHLIST *</Text>
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
                    onPress={handleAddDetectedProduct}
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  >
                    <Plus size={18} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>
                      {selectedResult ? "Add Selected Product" : "Add Detected Product"}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  if (mode === "link") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => { resetLinkState(); setMode("menu"); }} style={styles.backButton}>
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
              editable={!isScrapingUrl}
            />
            {productUrl.length > 0 && !isScrapingUrl && (
              <Pressable onPress={() => setProductUrl("")}>
                <X size={16} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {!scrapedData && (
            <Pressable
              onPress={handleAddFromLink}
              style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: isScrapingUrl ? 0.7 : 1 }]}
              disabled={isScrapingUrl}
            >
              {isScrapingUrl ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Sparkles size={18} color="#FFFFFF" />
              )}
              <Text style={styles.primaryButtonText}>
                {isScrapingUrl ? "Detecting..." : "Detect Product"}
              </Text>
            </Pressable>
          )}

          {scrapedData && (
            <View style={styles.detectionArea}>
              <View style={[styles.detectedCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.detectedHeader}>
                  <Sparkles size={18} color={colors.primary} />
                  <Text style={[styles.detectedTitle, { color: colors.primary }]}>Product Detected</Text>
                </View>
                <Text style={[styles.detectedName, { color: colors.text }]}>{scrapedData.title || "Unknown Product"}</Text>
                {scrapedData.store ? (
                  <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>Store: {scrapedData.store}</Text>
                ) : null}
                {scrapedData.price > 0 && (
                  <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>Price: ${scrapedData.price.toFixed(2)}</Text>
                )}
                {scrapedData.description ? (
                  <Text style={[styles.detectedDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {scrapedData.description}
                  </Text>
                ) : null}
              </View>

              {linkSearchResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <View style={styles.resultsSectionHeader}>
                    <Search size={16} color={colors.textSecondary} />
                    <Text style={[styles.resultsSectionTitle, { color: colors.text }]}>
                      Also Found ({linkSearchResults.length})
                    </Text>
                  </View>
                  {linkSearchResults.map((result, idx) => (
                    <Pressable
                      key={`link-result-${idx}`}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedLinkResult(selectedLinkResult === result ? null : result);
                      }}
                      style={[
                        styles.resultCard,
                        {
                          backgroundColor: selectedLinkResult === result ? colors.primaryFaded : colors.surface,
                          borderColor: selectedLinkResult === result ? colors.primary : colors.borderLight,
                        },
                      ]}
                    >
                      {result.image ? (
                        <Image source={{ uri: result.image }} style={styles.resultImage} contentFit="cover" />
                      ) : (
                        <View style={[styles.resultImagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                          <Search size={16} color={colors.textTertiary} />
                        </View>
                      )}
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
                          {result.title}
                        </Text>
                        <View style={styles.resultMeta}>
                          <Text style={[styles.resultPrice, { color: colors.primary }]}>
                            {result.price > 0 ? `${result.price.toFixed(2)}` : "Price N/A"}
                          </Text>
                          <Text style={[styles.resultStore, { color: colors.textSecondary }]}>
                            {result.store}
                          </Text>
                        </View>
                      </View>
                      {selectedLinkResult === result && (
                        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                          <Check size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>ADD TO WISHLIST *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.listChips}>
                    {wishlists.map((list) => (
                      <Pressable
                        key={list.id}
                        onPress={() => setLinkSelectedList(list.id)}
                        style={[
                          styles.listChip,
                          {
                            backgroundColor: linkSelectedList === list.id ? colors.primary : colors.surface,
                            borderColor: linkSelectedList === list.id ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 16 }}>{list.emoji}</Text>
                        <Text
                          style={[
                            styles.chipText,
                            { color: linkSelectedList === list.id ? "#FFFFFF" : colors.text },
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
                onPress={handleAddFromLinkResult}
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  {selectedLinkResult ? "Add Selected Product" : "Add Detected Product"}
                </Text>
              </Pressable>
            </View>
          )}
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

        {!hasWishlists && (
          <Pressable
            onPress={() => router.push("/create-list")}
            style={[styles.noListBanner, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "30" }]}
          >
            <Plus size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noListTitle, { color: colors.primary }]}>Create a wishlist first</Text>
              <Text style={[styles.noListDesc, { color: colors.textSecondary }]}>You need a list to save products to</Text>
            </View>
            <ChevronRight size={18} color={colors.primary} />
          </Pressable>
        )}

        <View style={styles.menuCards}>
          <Pressable
            onPress={() => setMode("image")}
            {...createPressHandlers(scaleAnim1)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim1 }] },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.primaryFaded }]}>
                <Camera size={28} color={colors.primary} />
              </View>
              <View style={styles.menuCardContent}>
                <Text style={[styles.menuCardTitle, { color: colors.text }]}>Scan from Image</Text>
                <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>
                  Upload a photo to auto-detect products
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={() => setMode("link")}
            {...createPressHandlers(scaleAnim2)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim2 }] },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#EDE7F6" }]}>
                <Link2 size={28} color="#7C4DFF" />
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
            {...createPressHandlers(scaleAnim3)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim3 }] },
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
  noListBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  noListTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  noListDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  menuCards: {
    gap: 14,
  },
  menuCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    flexDirection: "row" as const,
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
    flexDirection: "row" as const,
    gap: 10,
    paddingVertical: 4,
  },
  listChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
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
  imagePickerArea: {
    flexDirection: "row" as const,
    gap: 14,
  },
  imagePickerCard: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 36,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed" as const,
    gap: 10,
  },
  imagePickerLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  imagePickerHint: {
    fontSize: 12,
  },
  detectionArea: {
    gap: 16,
  },
  imagePreviewRow: {
    position: "relative" as const,
  },
  previewImage: {
    width: "100%" as const,
    height: 220,
    borderRadius: 20,
  },
  removeImageBtn: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  statusCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  detectedCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  detectedHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  detectedTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
  },
  detectedName: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  detectedMeta: {
    fontSize: 13,
  },
  detectedDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  resultsSection: {
    gap: 10,
  },
  resultsSectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  resultsSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  resultCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  resultImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  resultMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  resultStore: {
    fontSize: 12,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
});
