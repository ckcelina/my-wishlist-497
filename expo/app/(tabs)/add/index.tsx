import React, { useState, useRef, useCallback } from "react";
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
  LayoutChangeEvent,
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
  ScanBarcode,
  Type,
  Eye,
  ExternalLink,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { useLocation } from "@/providers/LocationProvider";
import { Product } from "@/types";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { searchProducts, scrapeProductUrl, searchByBarcode, searchByImage, SerpApiResult, VisualMatch } from "@/lib/api";
import ImageSelectionOverlay from "@/components/ImageSelectionOverlay";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().describe("Product name/title detected from the image"),
  description: z.string().describe("Brief product description"),
  category: z.string().describe("Product category like Electronics, Fashion, Home, Beauty, etc."),
  estimatedPrice: z.number().optional().describe("Estimated price if visible"),
  brand: z.string().optional().describe("Brand name if identifiable"),
  searchQuery: z.string().describe("Best search query to find this product online"),
});

const barcodeSchema = z.object({
  barcodeValue: z.string().describe("The barcode number (UPC, EAN, ISBN, QR code content, or any other barcode value). Return ONLY the numeric or alphanumeric code."),
  barcodeType: z.string().describe("Type of barcode detected: UPC-A, UPC-E, EAN-13, EAN-8, ISBN, QR, Code128, Code39, or Unknown"),
  productHint: z.string().optional().describe("If the barcode area has any visible product name or brand text near it, include it here"),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence level that a barcode was detected and correctly read"),
});

const textExtractSchema = z.object({
  extractedTexts: z.array(z.object({
    text: z.string().describe("The extracted text content"),
    type: z.enum(["product_name", "brand", "price", "description", "barcode", "url", "other"]).describe("What type of text this appears to be"),
  })).describe("All text found in the image, categorized by type"),
  suggestedSearchQuery: z.string().describe("Best search query to find this product based on all extracted text"),
  productName: z.string().optional().describe("The most likely product name from all extracted text"),
  brand: z.string().optional().describe("Brand name if found in text"),
  price: z.string().optional().describe("Price if found in text"),
});

type DetectedProduct = z.infer<typeof productSchema>;
type BarcodeResult = z.infer<typeof barcodeSchema>;
type TextExtractResult = z.infer<typeof textExtractSchema>;

export default function AddScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { serpApiCountryCode, city, format, currencyCode } = useLocation();

  const { wishlists, addProductToWishlist } = useWishlistContext();
  const hasWishlists = wishlists.length > 0;

  const [mode, setMode] = useState<"menu" | "link" | "manual" | "image" | "barcode" | "text">("menu");
  const [productUrl, setProductUrl] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [description, setDescription] = useState("");
  const [selectedList, setSelectedList] = useState<string>("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [showSelectionOverlay, setShowSelectionOverlay] = useState(false);
  const [imageOriginalWidth, setImageOriginalWidth] = useState(0);
  const [imageOriginalHeight, setImageOriginalHeight] = useState(0);
  const [imageDisplayWidth, setImageDisplayWidth] = useState(0);
  const [imageDisplayHeight, setImageDisplayHeight] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<DetectedProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SerpApiResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SerpApiResult | null>(null);
  const [visualMatches, setVisualMatches] = useState<VisualMatch[]>([]);
  const [isVisualSearching, setIsVisualSearching] = useState(false);
  const [visualSearchQuery, setVisualSearchQuery] = useState("");
  const [visualSearchError, setVisualSearchError] = useState<string | null>(null);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [scrapedData, setScrapedData] = useState<{ title: string; image: string; description: string; price: number; store: string } | null>(null);
  const [linkSearchResults, setLinkSearchResults] = useState<SerpApiResult[]>([]);
  const [selectedLinkResult, setSelectedLinkResult] = useState<SerpApiResult | null>(null);
  const [linkSelectedList, setLinkSelectedList] = useState<string>("");

  const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
  const [isReadingBarcode, setIsReadingBarcode] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
  const [barcodeSearchResults, setBarcodeSearchResults] = useState<SerpApiResult[]>([]);
  const [selectedBarcodeResult, setSelectedBarcodeResult] = useState<SerpApiResult | null>(null);
  const [barcodeSelectedList, setBarcodeSelectedList] = useState<string>("");
  const [isBarcodeSearching, setIsBarcodeSearching] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  const [textImage, setTextImage] = useState<string | null>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [textExtractResult, setTextExtractResult] = useState<TextExtractResult | null>(null);
  const [textSearchResults, setTextSearchResults] = useState<SerpApiResult[]>([]);
  const [selectedTextResult, setSelectedTextResult] = useState<SerpApiResult | null>(null);
  const [textSelectedList, setTextSelectedList] = useState<string>("");
  const [isTextSearching, setIsTextSearching] = useState(false);

  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const scaleAnim3 = useRef(new Animated.Value(1)).current;
  const scaleAnim4 = useRef(new Animated.Value(1)).current;
  const scaleAnim5 = useRef(new Animated.Value(1)).current;

  const createPressHandlers = (anim: Animated.Value) => ({
    onPressIn: () => {
      Animated.spring(anim, { toValue: 0.95, useNativeDriver: Platform.OS !== 'web' }).start();
    },
    onPressOut: () => {
      Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: Platform.OS !== 'web' }).start();
    },
  });

  const resetImageState = () => {
    setSelectedImage(null);
    setImageBase64(null);
    setImageMimeType("image/jpeg");
    setShowSelectionOverlay(false);
    setImageOriginalWidth(0);
    setImageOriginalHeight(0);
    setImageDisplayWidth(0);
    setImageDisplayHeight(0);
    setIsProcessing(false);
    setDetectedProduct(null);
    setSearchResults([]);
    setSelectedResult(null);
    setIsDetecting(false);
    setIsSearching(false);
    setSelectedList("");
    setVisualMatches([]);
    setIsVisualSearching(false);
    setVisualSearchQuery("");
    setVisualSearchError(null);
  };

  const resetBarcodeState = () => {
    setBarcodeImage(null);
    setBarcodeResult(null);
    setBarcodeSearchResults([]);
    setSelectedBarcodeResult(null);
    setBarcodeSelectedList("");
    setIsReadingBarcode(false);
    setIsBarcodeSearching(false);
    setManualBarcode("");
  };

  const resetTextState = () => {
    setTextImage(null);
    setTextExtractResult(null);
    setTextSearchResults([]);
    setSelectedTextResult(null);
    setTextSelectedList("");
    setIsExtractingText(false);
    setIsTextSearching(false);
  };

  const handlePickImage = async () => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert("Permission Needed", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      console.log("[ImagePicker] Got image:", asset.width, "x", asset.height);
      setSelectedImage(asset.uri);
      setImageBase64(asset.base64 || null);
      setImageMimeType(asset.mimeType || "image/jpeg");
      setImageOriginalWidth(asset.width);
      setImageOriginalHeight(asset.height);
      setDetectedProduct(null);
      setSearchResults([]);
      setSelectedResult(null);
      setVisualMatches([]);
      setShowSelectionOverlay(true);
      setIsProcessing(false);

      if (!asset.base64) {
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
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      console.log("[Camera] Got image:", asset.width, "x", asset.height);
      setSelectedImage(asset.uri);
      setImageBase64(asset.base64 || null);
      setImageMimeType(asset.mimeType || "image/jpeg");
      setImageOriginalWidth(asset.width);
      setImageOriginalHeight(asset.height);
      setDetectedProduct(null);
      setSearchResults([]);
      setSelectedResult(null);
      setVisualMatches([]);
      setShowSelectionOverlay(true);
      setIsProcessing(false);
    } catch (err) {
      console.error("[Camera] Error:", err);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  const compressImageForSearch = async (uri: string): Promise<string | null> => {
    try {
      const context = ImageManipulator.manipulate(uri);
      context.resize({ width: 800 });
      const imageRef = await context.renderAsync();
      const result = await imageRef.saveAsync({
        base64: true,
        format: SaveFormat.JPEG,
        compress: 0.55,
      });
      console.log(`[ImageSearch] Compressed image base64 length: ${result.base64?.length ?? 0}`);
      return result.base64 || null;
    } catch (err) {
      console.error("[ImageSearch] Compression failed:", err);
      return null;
    }
  };

  const handleSearchFullImage = useCallback(async () => {
    if (!imageBase64 || !selectedImage) return;
    console.log("[ImageSearch] Searching full image");
    setShowSelectionOverlay(false);
    setIsProcessing(true);
    const compressed = await compressImageForSearch(selectedImage);
    await processImageSearch(compressed ?? imageBase64, "image/jpeg");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageBase64, imageMimeType, selectedImage]);

  const handleSearchSelection = useCallback(async (selection: {
    x: number;
    y: number;
    width: number;
    height: number;
    imageWidth: number;
    imageHeight: number;
  }) => {
    if (!selectedImage || !imageBase64) return;
    console.log("[ImageSearch] Searching selection:", JSON.stringify(selection));
    setShowSelectionOverlay(false);
    setIsProcessing(true);

    try {
      const scaleX = imageOriginalWidth / selection.imageWidth;
      const scaleY = imageOriginalHeight / selection.imageHeight;

      const cropRect = {
        originX: Math.round(selection.x * scaleX),
        originY: Math.round(selection.y * scaleY),
        width: Math.round(selection.width * scaleX),
        height: Math.round(selection.height * scaleY),
      };

      console.log("[ImageSearch] Crop rect (original coords):", JSON.stringify(cropRect));

      const context = ImageManipulator.manipulate(selectedImage);
      context.crop(cropRect);
      const imageRef = await context.renderAsync();
      const result = await imageRef.saveAsync({
        base64: true,
        format: SaveFormat.JPEG,
        compress: 0.8,
      });

      if (result.base64) {
        console.log(`[ImageSearch] Cropped image ready (base64 length: ${result.base64.length}), compressing...`);
        const compressed = await compressImageForSearch(result.uri);
        await processImageSearch(compressed ?? result.base64, "image/jpeg");
      } else {
        console.log("[ImageSearch] No base64 from crop, falling back to full image");
        const compressed = await compressImageForSearch(selectedImage);
        await processImageSearch(compressed ?? imageBase64, imageMimeType);
      }
    } catch (err) {
      console.error("[ImageSearch] Crop failed:", err);
      console.log("[ImageSearch] Falling back to full image search");
      const compressed = await compressImageForSearch(selectedImage);
      await processImageSearch(compressed ?? imageBase64, imageMimeType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, imageBase64, imageMimeType, imageOriginalWidth, imageOriginalHeight]);

  const onImageContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setImageDisplayWidth(width);
    setImageDisplayHeight(height);
    console.log("[ImageLayout] Display size:", width, "x", height);
  }, []);

  const processImageSearch = async (base64: string, mimeType: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVisualSearching(true);
    setIsDetecting(true);
    setVisualSearchError(null);

    const visualSearchPromise = searchByImage(
      base64,
      serpApiCountryCode,
      city,
      mimeType
    ).then((result) => {
      console.log("[VisualSearch] Got result:", result.visualMatches.length, "matches");
      setVisualMatches(result.visualMatches);
      setVisualSearchQuery(result.searchQuery);

      if (result.shoppingResults.length > 0) {
        setSearchResults(result.shoppingResults);
        setIsSearching(false);
      }

      if (result.error) {
        console.log("[VisualSearch] Error:", result.error);
        if (result.visualMatches.length === 0 && result.shoppingResults.length === 0) {
          setVisualSearchError(result.error);
        }
      }

      return result;
    }).catch((err) => {
      console.error("[VisualSearch] Failed:", err);
      setVisualSearchError("Visual search failed");
      return null;
    }).finally(() => {
      setIsVisualSearching(false);
    });

    const aiDetectPromise = detectProductFromImage(base64, mimeType);

    const [visualResult] = await Promise.allSettled([visualSearchPromise, aiDetectPromise]);

    if (
      visualResult.status === "fulfilled" &&
      visualResult.value &&
      visualResult.value.shoppingResults.length === 0 &&
      detectedProduct
    ) {
      console.log("[ImageSearch] Visual search had no shopping results, using AI query as fallback");
    }
  };

  const detectProductFromImage = async (base64: string, mimeType: string) => {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        console.log(`[AI] Detecting product from image (attempt ${attempt + 1})...`);

        const truncatedBase64 = base64.length > 500000 ? base64.substring(0, 500000) : base64;

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
                  image: `data:${mimeType};base64,${truncatedBase64}`,
                },
              ],
            },
          ],
          schema: productSchema,
        });

        console.log("[AI] Detected product:", JSON.stringify(detected));
        setDetectedProduct(detected);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (searchResults.length === 0) {
          const cityQuery = city ? `${detected.searchQuery} ${city} delivery` : detected.searchQuery;
          await searchForProduct(cityQuery);
        }
        return;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[AI] Detection failed (attempt ${attempt + 1}):`, errorMsg);

        if (errorMsg.includes("404") && attempt < maxRetries) {
          console.log("[AI] Got 404, retrying after short delay...");
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          attempt++;
          continue;
        }

        if (searchResults.length === 0 && visualMatches.length === 0) {
          console.log("[AI] No visual results either, showing fallback message");
        }
        return;
      } finally {
        setIsDetecting(false);
        setIsProcessing(false);
      }
    }
  };

  const searchForProduct = async (query: string) => {
    setIsSearching(true);
    try {
      console.log("[Search] Searching for:", query);
      const { results, error } = await searchProducts(query, serpApiCountryCode);

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
      country: serpApiCountryCode.toUpperCase(),
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
        const { results } = await searchProducts(result.title, serpApiCountryCode);
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
      country: serpApiCountryCode.toUpperCase(),
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
      country: serpApiCountryCode.toUpperCase(),
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

  const pickImageForBarcode = async (useCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const permResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permResult.granted) {
          Alert.alert("Permission Needed", "Please allow camera access.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          base64: true,
        });
      } else {
        const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permResult.granted) {
          Alert.alert("Permission Needed", "Please allow access to your photo library.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          base64: true,
        });
      }

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setBarcodeImage(asset.uri);
      setBarcodeResult(null);
      setBarcodeSearchResults([]);
      setSelectedBarcodeResult(null);

      if (asset.base64) {
        await readBarcodeFromImage(asset.base64, asset.mimeType || "image/jpeg");
      } else {
        Alert.alert("Error", "Could not read image data.");
      }
    } catch (err) {
      console.error("[Barcode] Image pick error:", err);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const readBarcodeFromImage = async (base64: string, mimeType: string) => {
    setIsReadingBarcode(true);
    try {
      console.log("[AI] Reading barcode from image...");
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Look at this image carefully. Find any barcode, QR code, UPC code, EAN code, ISBN, or similar machine-readable code. Read the numeric or alphanumeric value from the barcode. Also note any product name or brand text visible near the barcode. If no barcode is found, set confidence to 'low' and try to read any numbers that look like product codes.",
              },
              {
                type: "image",
                image: `data:${mimeType};base64,${base64}`,
              },
            ],
          },
        ],
        schema: barcodeSchema,
      });

      console.log("[AI] Barcode result:", JSON.stringify(result));
      setBarcodeResult(result);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result.confidence !== "low" && result.barcodeValue) {
        await searchBarcode(result.barcodeValue, result.productHint);
      } else if (result.productHint) {
        await searchBarcode(result.productHint);
      }
    } catch (err) {
      console.error("[AI] Barcode reading failed:", err);
      Alert.alert("Scan Failed", "Could not read barcode. Try entering it manually or take a clearer photo.");
    } finally {
      setIsReadingBarcode(false);
    }
  };

  const searchBarcode = async (code: string, hint?: string) => {
    setIsBarcodeSearching(true);
    try {
      const searchQuery = hint ? `${code} ${hint}` : code;
      console.log("[Barcode] Searching for:", searchQuery);

      const { results, error } = await searchByBarcode(searchQuery, serpApiCountryCode);

      if (error) {
        console.log("[Barcode] Search error:", error);
      }

      if (results.length === 0 && hint) {
        console.log("[Barcode] No results with code, trying hint only:", hint);
        const fallback = await searchProducts(hint, serpApiCountryCode);
        setBarcodeSearchResults(fallback.results);
      } else {
        setBarcodeSearchResults(results);
      }

      console.log(`[Barcode] Got ${results.length} results`);
    } catch (err) {
      console.error("[Barcode] Search failed:", err);
    } finally {
      setIsBarcodeSearching(false);
    }
  };

  const handleManualBarcodeSearch = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert("Enter Barcode", "Please type a barcode number.");
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBarcodeResult({
      barcodeValue: manualBarcode.trim(),
      barcodeType: "Manual",
      confidence: "high",
    });
    await searchBarcode(manualBarcode.trim());
  };

  const handleAddFromBarcode = () => {
    if (!barcodeSelectedList) {
      Alert.alert("Select a List", "Please choose a wishlist to add to.");
      return;
    }

    const src = selectedBarcodeResult;
    const productTitle = src?.title || barcodeResult?.productHint || "Scanned Product";
    const productPrice = src?.price || 0;
    const productStore = src?.store || "Unknown Store";
    const productImage = src?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

    const newProduct: Product = {
      id: `barcode_${Date.now()}`,
      title: productTitle,
      image: productImage,
      price: productPrice,
      currency: src?.currency || "USD",
      store: productStore,
      storeUrl: src?.link || "",
      description: src?.snippet || `Barcode: ${barcodeResult?.barcodeValue || ""}`,
      category: "Other",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: serpApiCountryCode.toUpperCase(),
      rating: src?.rating,
    };

    addProductToWishlist(barcodeSelectedList, newProduct);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Added!", `"${productTitle}" has been added to your wishlist.`);
    resetBarcodeState();
    setMode("menu");
  };

  const pickImageForText = async (useCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const permResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permResult.granted) {
          Alert.alert("Permission Needed", "Please allow camera access.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          base64: true,
        });
      } else {
        const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permResult.granted) {
          Alert.alert("Permission Needed", "Please allow access to your photo library.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          base64: true,
        });
      }

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setTextImage(asset.uri);
      setTextExtractResult(null);
      setTextSearchResults([]);
      setSelectedTextResult(null);

      if (asset.base64) {
        await extractTextFromImage(asset.base64, asset.mimeType || "image/jpeg");
      } else {
        Alert.alert("Error", "Could not read image data.");
      }
    } catch (err) {
      console.error("[TextScan] Image pick error:", err);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const extractTextFromImage = async (base64: string, mimeType: string) => {
    setIsExtractingText(true);
    try {
      console.log("[AI] Extracting text from image...");
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract ALL text visible in this image. Categorize each piece of text as: product_name, brand, price, description, barcode, url, or other. Then suggest the best search query to find this product online based on all the text you found. Identify the product name and brand if visible.",
              },
              {
                type: "image",
                image: `data:${mimeType};base64,${base64}`,
              },
            ],
          },
        ],
        schema: textExtractSchema,
      });

      console.log("[AI] Text extraction result:", JSON.stringify(result));
      setTextExtractResult(result);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result.suggestedSearchQuery) {
        await searchFromExtractedText(result.suggestedSearchQuery);
      }
    } catch (err) {
      console.error("[AI] Text extraction failed:", err);
      Alert.alert("Extraction Failed", "Could not read text from image. Try a clearer photo.");
    } finally {
      setIsExtractingText(false);
    }
  };

  const searchFromExtractedText = async (query: string) => {
    setIsTextSearching(true);
    try {
      console.log("[TextScan] Searching for:", query);
      const { results, error } = await searchProducts(query, serpApiCountryCode);

      if (error) {
        console.log("[TextScan] Search error:", error);
      }

      setTextSearchResults(results);
      console.log(`[TextScan] Got ${results.length} results`);
    } catch (err) {
      console.error("[TextScan] Search failed:", err);
    } finally {
      setIsTextSearching(false);
    }
  };

  const handleAddFromText = () => {
    if (!textSelectedList) {
      Alert.alert("Select a List", "Please choose a wishlist to add to.");
      return;
    }

    const src = selectedTextResult;
    const productTitle = src?.title || textExtractResult?.productName || "Product from Text";
    const productPrice = src?.price || 0;
    const productStore = src?.store || "Unknown Store";
    const productImage = src?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

    const newProduct: Product = {
      id: `text_${Date.now()}`,
      title: productTitle,
      image: productImage,
      price: productPrice,
      currency: src?.currency || "USD",
      store: productStore,
      storeUrl: src?.link || "",
      description: src?.snippet || "",
      category: "Other",
      isPurchased: false,
      addedAt: new Date().toISOString().split("T")[0],
      country: serpApiCountryCode.toUpperCase(),
      rating: src?.rating,
    };

    addProductToWishlist(textSelectedList, newProduct);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Added!", `"${productTitle}" has been added to your wishlist.`);
    resetTextState();
    setMode("menu");
  };

  const renderSearchResults = (
    results: SerpApiResult[],
    selected: SerpApiResult | null,
    onSelect: (r: SerpApiResult | null) => void,
    isLoading: boolean,
    loadingLabel: string
  ) => (
    <>
      {isLoading && (
        <View style={[styles.statusCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={[styles.statusText, { color: colors.primary }]}>{loadingLabel}</Text>
        </View>
      )}

      {results.length > 0 && !isLoading && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsSectionHeader}>
            <Search size={16} color={colors.textSecondary} />
            <Text style={[styles.resultsSectionTitle, { color: colors.text }]}>
              Found in Stores ({results.length})
            </Text>
          </View>
          {results.map((result, idx) => (
            <Pressable
              key={`result-${idx}`}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(selected === result ? null : result);
              }}
              style={[
                styles.resultCard,
                {
                  backgroundColor: selected === result ? colors.primaryFaded : colors.surface,
                  borderColor: selected === result ? colors.primary : colors.borderLight,
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
                    {result.price > 0 ? format(result.price, result.currency || "USD") : "Price N/A"}
                  </Text>
                  <Text style={[styles.resultStore, { color: colors.textSecondary }]}>
                    {result.store}
                  </Text>
                </View>
              </View>
              {selected === result && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </>
  );

  const renderWishlistSelector = (
    selectedListId: string,
    onSelectList: (id: string) => void,
    onAdd: () => void,
    addLabel: string
  ) => (
    <>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>ADD TO WISHLIST *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.listChips}>
            {wishlists.map((list) => (
              <Pressable
                key={list.id}
                onPress={() => onSelectList(list.id)}
                style={[
                  styles.listChip,
                  {
                    backgroundColor: selectedListId === list.id ? colors.primary : colors.surface,
                    borderColor: selectedListId === list.id ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{list.emoji}</Text>
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedListId === list.id ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {list.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {!selectedListId && (
          <Text style={[styles.selectListHint, { color: colors.textTertiary }]}>
            Tap a list above to enable adding
          </Text>
        )}
      </View>

      <Pressable
        onPress={selectedListId ? onAdd : undefined}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: selectedListId ? 1 : 0.35 }]}
      >
        <Plus size={18} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>{addLabel}</Text>
      </Pressable>
    </>
  );

  if (mode === "barcode") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => { resetBarcodeState(); setMode("menu"); }} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.formTitle, { color: colors.text }]}>Scan Barcode</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            Photograph a barcode or enter it manually to find the product
          </Text>

          {!barcodeImage && !barcodeResult && (
            <>
              <View style={styles.imagePickerArea}>
                <Pressable
                  onPress={() => pickImageForBarcode(false)}
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
                    onPress={() => pickImageForBarcode(true)}
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

              <View style={[styles.dividerRow, { borderColor: colors.borderLight }]}>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or enter manually</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ScanBarcode size={18} color={colors.textTertiary} />
                <TextInput
                  placeholder="Enter barcode number (UPC, EAN, ISBN)..."
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, { color: colors.text }]}
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  keyboardType="default"
                  onSubmitEditing={handleManualBarcodeSearch}
                  returnKeyType="search"
                />
                {manualBarcode.length > 0 && (
                  <Pressable onPress={() => setManualBarcode("")}>
                    <X size={16} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={handleManualBarcodeSearch}
                style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: manualBarcode.length === 0 ? 0.5 : 1 }]}
                disabled={manualBarcode.length === 0}
              >
                <Search size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Search Barcode</Text>
              </Pressable>
            </>
          )}

          {barcodeImage && (
            <View style={styles.detectionArea}>
              <View style={styles.imagePreviewRow}>
                <Image source={{ uri: barcodeImage }} style={styles.previewImage} contentFit="cover" />
                <Pressable
                  onPress={() => { setBarcodeImage(null); setBarcodeResult(null); setBarcodeSearchResults([]); }}
                  style={[styles.removeImageBtn, { backgroundColor: colors.error + "20" }]}
                >
                  <X size={16} color={colors.error} />
                </Pressable>
              </View>

              {isReadingBarcode && (
                <View style={[styles.statusCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.statusText, { color: colors.primary }]}>
                    Reading barcode with AI...
                  </Text>
                </View>
              )}

              {barcodeResult && !isReadingBarcode && (
                <View style={[styles.detectedCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.detectedHeader}>
                    <ScanBarcode size={18} color={colors.primary} />
                    <Text style={[styles.detectedTitle, { color: colors.primary }]}>Barcode Detected</Text>
                  </View>
                  <Text style={[styles.detectedName, { color: colors.text }]}>{barcodeResult.barcodeValue}</Text>
                  <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>
                    Type: {barcodeResult.barcodeType} · Confidence: {barcodeResult.confidence}
                  </Text>
                  {barcodeResult.productHint ? (
                    <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>
                      Product hint: {barcodeResult.productHint}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {(barcodeResult || isBarcodeSearching || barcodeSearchResults.length > 0) && (
            <View style={styles.detectionArea}>
              {renderSearchResults(
                barcodeSearchResults,
                selectedBarcodeResult,
                setSelectedBarcodeResult,
                isBarcodeSearching,
                "Searching stores for barcode..."
              )}

              {barcodeResult && !isReadingBarcode && !isBarcodeSearching && (
                renderWishlistSelector(
                  barcodeSelectedList,
                  setBarcodeSelectedList,
                  handleAddFromBarcode,
                  selectedBarcodeResult ? "Add Selected Product" : "Add Scanned Product"
                )
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  if (mode === "text") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => { resetTextState(); setMode("menu"); }} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.formTitle, { color: colors.text }]}>Read Text from Photo</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            Photograph product labels, packaging, or price tags to extract text and search
          </Text>

          {!textImage && (
            <View style={styles.imagePickerArea}>
              <Pressable
                onPress={() => pickImageForText(false)}
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
                  onPress={() => pickImageForText(true)}
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
          )}

          {textImage && (
            <View style={styles.detectionArea}>
              <View style={styles.imagePreviewRow}>
                <Image source={{ uri: textImage }} style={styles.previewImage} contentFit="cover" />
                <Pressable
                  onPress={() => resetTextState()}
                  style={[styles.removeImageBtn, { backgroundColor: colors.error + "20" }]}
                >
                  <X size={16} color={colors.error} />
                </Pressable>
              </View>

              {isExtractingText && (
                <View style={[styles.statusCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.statusText, { color: colors.primary }]}>
                    Extracting text with AI...
                  </Text>
                </View>
              )}

              {textExtractResult && !isExtractingText && (
                <View style={[styles.detectedCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.detectedHeader}>
                    <Type size={18} color={colors.primary} />
                    <Text style={[styles.detectedTitle, { color: colors.primary }]}>Text Extracted</Text>
                  </View>
                  {textExtractResult.productName ? (
                    <Text style={[styles.detectedName, { color: colors.text }]}>
                      {textExtractResult.productName}
                    </Text>
                  ) : null}
                  {textExtractResult.brand ? (
                    <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>
                      Brand: {textExtractResult.brand}
                    </Text>
                  ) : null}
                  {textExtractResult.price ? (
                    <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>
                      Price: {textExtractResult.price}
                    </Text>
                  ) : null}

                  {textExtractResult.extractedTexts.length > 0 && (
                    <View style={styles.extractedTextList}>
                      {textExtractResult.extractedTexts.slice(0, 8).map((item, idx) => (
                        <View
                          key={`text-${idx}`}
                          style={[styles.extractedTextChip, { backgroundColor: colors.surfaceSecondary }]}
                        >
                          <View style={[styles.textTypeBadge, {
                            backgroundColor:
                              item.type === "product_name" ? colors.primary + "20" :
                              item.type === "brand" ? colors.success + "20" :
                              item.type === "price" ? colors.warning + "20" :
                              colors.surfaceSecondary,
                          }]}>
                            <Text style={[styles.textTypeLabel, {
                              color:
                                item.type === "product_name" ? colors.primary :
                                item.type === "brand" ? colors.success :
                                item.type === "price" ? colors.warning :
                                colors.textTertiary,
                            }]}>
                              {item.type.replace("_", " ")}
                            </Text>
                          </View>
                          <Text style={[styles.extractedTextValue, { color: colors.text }]} numberOfLines={2}>
                            {item.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={[styles.searchQueryTag, { backgroundColor: colors.primaryFaded }]}>
                    <Search size={12} color={colors.primary} />
                    <Text style={[styles.searchQueryText, { color: colors.primary }]} numberOfLines={1}>
                      {`Searching: "${textExtractResult.suggestedSearchQuery}"`}
                    </Text>
                  </View>
                </View>
              )}

              {renderSearchResults(
                textSearchResults,
                selectedTextResult,
                setSelectedTextResult,
                isTextSearching,
                "Searching stores..."
              )}

              {textExtractResult && !isExtractingText && !isTextSearching && (
                renderWishlistSelector(
                  textSelectedList,
                  setTextSelectedList,
                  handleAddFromText,
                  selectedTextResult ? "Add Selected Product" : "Add Detected Product"
                )
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

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
              {showSelectionOverlay && !isProcessing ? (
                <View style={styles.selectionOverlayContainer}>
                  <View
                    style={styles.selectionImageWrapper}
                    onLayout={onImageContainerLayout}
                  >
                    <Image
                      source={{ uri: selectedImage }}
                      style={[styles.selectionPreviewImage, { height: 320 }]}
                      contentFit="contain"
                    />
                    {imageDisplayWidth > 0 && imageDisplayHeight > 0 && (
                      <ImageSelectionOverlay
                        imageWidth={imageDisplayWidth}
                        imageHeight={320}
                        onSelectionConfirm={handleSearchSelection}
                        onSearchFull={handleSearchFullImage}
                        primaryColor={colors.primary}
                        textColor={colors.text}
                        surfaceColor={colors.surface}
                      />
                    )}
                  </View>
                  <Pressable
                    onPress={resetImageState}
                    style={[styles.selectionCloseBtn, { backgroundColor: colors.error + "20" }]}
                  >
                    <X size={16} color={colors.error} />
                    <Text style={[styles.selectionCloseBtnText, { color: colors.error }]}>Choose Different Image</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.imagePreviewRow}>
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} contentFit="cover" />
                    <Pressable
                      onPress={resetImageState}
                      style={[styles.removeImageBtn, { backgroundColor: colors.error + "20" }]}
                    >
                      <X size={16} color={colors.error} />
                    </Pressable>
                  </View>
                </>
              )}

              {!showSelectionOverlay && (isVisualSearching || isDetecting) && (
                <View style={[styles.statusCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusText, { color: colors.primary }]}>
                      {isVisualSearching ? "Searching with Google Lens..." : "Analyzing product with AI..."}
                    </Text>
                    {isVisualSearching && (
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                        Uploading image & finding visual matches in {serpApiCountryCode.toUpperCase()}{city ? `, ${city}` : ""}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {!showSelectionOverlay && isProcessing && !isVisualSearching && !isDetecting && searchResults.length === 0 && visualMatches.length === 0 && !visualSearchError && (
                <View style={[styles.statusCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "20" }]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.statusText, { color: colors.primary }]}>Processing image...</Text>
                </View>
              )}

              {!showSelectionOverlay && visualSearchError && !isVisualSearching && !isDetecting && searchResults.length === 0 && (
                <View style={[styles.statusCard, { backgroundColor: colors.error + "10", borderColor: colors.error + "30" }]}>
                  <Text style={[styles.statusText, { color: colors.error }]}>
                    {visualSearchError}
                  </Text>
                </View>
              )}

              {!showSelectionOverlay && visualSearchQuery && !isVisualSearching && (
                <View style={[styles.searchQueryTag, { backgroundColor: colors.primaryFaded }]}>
                  <Eye size={12} color={colors.primary} />
                  <Text style={[styles.searchQueryText, { color: colors.primary }]} numberOfLines={1}>
                    {`Lens identified: "${visualSearchQuery}"`}
                  </Text>
                </View>
              )}

              {!showSelectionOverlay && visualMatches.length > 0 && !isVisualSearching && (
                <View style={styles.resultsSection}>
                  <View style={styles.resultsSectionHeader}>
                    <Eye size={16} color={colors.textSecondary} />
                    <Text style={[styles.resultsSectionTitle, { color: colors.text }]}>
                      Visual Matches ({visualMatches.length})
                    </Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                    <View style={{ flexDirection: "row" as const, gap: 10 }}>
                      {visualMatches.slice(0, 8).map((match, idx) => (
                        <Pressable
                          key={`vm-${idx}`}
                          onPress={() => {
                            if (match.link) {
                              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                          }}
                          style={[
                            styles.visualMatchCard,
                            { backgroundColor: colors.surface, borderColor: colors.borderLight },
                          ]}
                        >
                          {match.thumbnail ? (
                            <Image source={{ uri: match.thumbnail }} style={styles.visualMatchImage} contentFit="cover" />
                          ) : (
                            <View style={[styles.visualMatchImage, { backgroundColor: colors.surfaceSecondary, justifyContent: "center" as const, alignItems: "center" as const }]}>
                              <Search size={16} color={colors.textTertiary} />
                            </View>
                          )}
                          <Text style={[styles.visualMatchTitle, { color: colors.text }]} numberOfLines={2}>
                            {match.title}
                          </Text>
                          <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 4 }}>
                            <Text style={[styles.visualMatchSource, { color: colors.textSecondary }]} numberOfLines={1}>
                              {match.source}
                            </Text>
                            {match.link ? <ExternalLink size={10} color={colors.textTertiary} /> : null}
                          </View>
                          {match.price ? (
                            <Text style={[styles.visualMatchPrice, { color: colors.primary }]} numberOfLines={1}>
                              {match.price.replace(/["{}]/g, "")}
                            </Text>
                          ) : null}
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {!showSelectionOverlay && detectedProduct && !isDetecting && (
                <View style={[styles.detectedCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.detectedHeader}>
                    <Sparkles size={18} color={colors.primary} />
                    <Text style={[styles.detectedTitle, { color: colors.primary }]}>AI Detection</Text>
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
                      Est. Price: {format(detectedProduct.estimatedPrice, currencyCode)}
                    </Text>
                  )}
                  <Text style={[styles.detectedDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {detectedProduct.description}
                  </Text>
                </View>
              )}

              {!showSelectionOverlay && renderSearchResults(
                searchResults,
                selectedResult,
                setSelectedResult,
                isSearching,
                `Searching stores in ${serpApiCountryCode.toUpperCase()}${city ? `, ${city}` : ""}...`
              )}

              {!showSelectionOverlay && (detectedProduct || visualMatches.length > 0) && !isDetecting && !isSearching && !isVisualSearching && (
                renderWishlistSelector(
                  selectedList,
                  setSelectedList,
                  handleAddDetectedProduct,
                  selectedResult ? "Add Selected Product" : "Add Detected Product"
                )
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
            {"We'll automatically detect the product details"}
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
                  <Text style={[styles.detectedMeta, { color: colors.textSecondary }]}>Price: {format(scrapedData.price, currencyCode)}</Text>
                )}
                {scrapedData.description ? (
                  <Text style={[styles.detectedDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {scrapedData.description}
                  </Text>
                ) : null}
              </View>

              {renderSearchResults(
                linkSearchResults,
                selectedLinkResult,
                setSelectedLinkResult,
                false,
                ""
              )}

              {renderWishlistSelector(
                linkSelectedList,
                setLinkSelectedList,
                handleAddFromLinkResult,
                selectedLinkResult ? "Add Selected Product" : "Add Detected Product"
              )}
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
          {"Choose how you'd like to add an item"}
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
            onPress={() => setMode("barcode")}
            {...createPressHandlers(scaleAnim4)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim4 }] },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#FFF3E0" }]}>
                <ScanBarcode size={28} color="#EF6C00" />
              </View>
              <View style={styles.menuCardContent}>
                <Text style={[styles.menuCardTitle, { color: colors.text }]}>Scan Barcode</Text>
                <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>
                  Read UPC, EAN, or ISBN from a photo
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={() => setMode("text")}
            {...createPressHandlers(scaleAnim5)}
          >
            <Animated.View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim5 }] },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#E3F2FD" }]}>
                <Type size={28} color="#1565C0" />
              </View>
              <View style={styles.menuCardContent}>
                <Text style={[styles.menuCardTitle, { color: colors.text }]}>Read Text from Photo</Text>
                <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>
                  Extract product info from labels & tags
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
  dividerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  extractedTextList: {
    marginTop: 10,
    gap: 8,
  },
  extractedTextChip: {
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  textTypeBadge: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textTypeLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  extractedTextValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 19,
  },
  searchQueryTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  searchQueryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    flex: 1,
  },
  visualMatchCard: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden" as const,
    paddingBottom: 10,
  },
  visualMatchImage: {
    width: 140,
    height: 100,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  visualMatchTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    paddingHorizontal: 8,
    paddingTop: 8,
    lineHeight: 16,
  },
  visualMatchSource: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingTop: 4,
    flex: 1,
  },
  visualMatchPrice: {
    fontSize: 12,
    fontWeight: "700" as const,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  selectListHint: {
    fontSize: 12,
    marginTop: 8,
  },
  selectionOverlayContainer: {
    gap: 12,
  },
  selectionImageWrapper: {
    position: "relative" as const,
    borderRadius: 20,
    overflow: "hidden" as const,
  },
  selectionPreviewImage: {
    width: "100%" as const,
    borderRadius: 20,
  },
  selectionCloseBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  selectionCloseBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
