import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Heart, ExternalLink, Check } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useLocation } from "@/providers/LocationProvider";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  variant?: "compact" | "full" | "horizontal";
}

export default React.memo(function ProductCard({
  product,
  onPress,
  variant = "compact",
}: ProductCardProps) {
  const colors = useAppColors();
  const { format } = useLocation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  if (variant === "horizontal") {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.horizontalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={{ uri: product.image }}
            style={styles.horizontalImage}
            contentFit="cover"
          />
          <View style={styles.horizontalContent}>
            <Text style={[styles.horizontalTitle, { color: colors.text }]} numberOfLines={2}>
              {product.title}
            </Text>
            <Text style={[styles.store, { color: colors.textTertiary }]}>
              {product.store}
            </Text>
            <View style={styles.horizontalBottom}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {format(product.price, product.currency)}
              </Text>
              {product.isPurchased && (
                <View style={[styles.purchasedBadge, { backgroundColor: colors.success + "20" }]}>
                  <Check size={12} color={colors.success} />
                  <Text style={[styles.purchasedText, { color: colors.success }]}>Bought</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          variant === "full" ? styles.fullCard : styles.compactCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderLight,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={variant === "full" ? styles.fullImage : styles.compactImage}
            contentFit="cover"
          />
          {product.isPurchased && (
            <View style={[styles.purchasedOverlay, { backgroundColor: colors.success + "CC" }]}>
              <Check size={16} color="#fff" />
            </View>
          )}
          <Pressable
            style={[styles.heartButton, { backgroundColor: colors.surface + "E6" }]}
          >
            <Heart size={16} color={colors.primary} fill={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={[styles.store, { color: colors.textTertiary }]}>{product.store}</Text>
          <View style={styles.cardFooter}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {format(product.price, product.currency)}
            </Text>
            <ExternalLink size={14} color={colors.textTertiary} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  compactCard: {
    width: 170,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  fullCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  compactImage: {
    width: "100%",
    height: 140,
  },
  fullImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 18,
  },
  store: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  price: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  purchasedOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  horizontalImage: {
    width: 100,
    height: 100,
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 4,
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 18,
  },
  horizontalBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  purchasedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  purchasedText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
});
