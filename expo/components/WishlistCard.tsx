import React, { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform } from "react-native";
import { Image } from "expo-image";
import { Users, Lock, ShoppingBag } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { Wishlist } from "@/types";

interface WishlistCardProps {
  wishlist: Wishlist;
  onPress?: () => void;
  variant?: "grid" | "row";
}

export default React.memo(function WishlistCard({
  wishlist,
  onPress,
  variant = "grid",
}: WishlistCardProps) {
  const colors = useAppColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const themeColor = wishlist.color || colors.primary;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: Platform.OS !== 'web' }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: Platform.OS !== 'web' }).start();
  };

  const purchasedCount = wishlist.items.filter((i) => i.isPurchased).length;
  const progress = wishlist.items.length > 0 ? purchasedCount / wishlist.items.length : 0;

  if (variant === "row") {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.rowCard,
            { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={[styles.rowEmoji, { backgroundColor: themeColor + "18" }]}>
            <Text style={styles.rowEmojiText}>{wishlist.emoji}</Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
              {wishlist.title}
            </Text>
            <View style={styles.rowMeta}>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                {wishlist.items.length} {wishlist.items.length === 1 ? "item" : "items"}
              </Text>
              {wishlist.isShared && (
                <View style={styles.rowSharedDot}>
                  <Users size={10} color={colors.textTertiary} />
                  <Text style={[styles.rowSharedText, { color: colors.textTertiary }]}>
                    {wishlist.collaborators.length}
                  </Text>
                </View>
              )}
            </View>
            {wishlist.items.length > 0 && (
              <View style={[styles.rowProgress, { backgroundColor: colors.surfaceSecondary }]}>
                <View style={[styles.rowProgressFill, { width: `${progress * 100}%`, backgroundColor: themeColor }]} />
              </View>
            )}
          </View>
          <View style={styles.rowRight}>
            {wishlist.isShared ? (
              <View style={styles.collaboratorRow}>
                {wishlist.collaborators.slice(0, 3).map((c, i) => (
                  <Image
                    key={c.id}
                    source={c.avatar ? { uri: c.avatar } : require("@/assets/images/icon.png")}
                    style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0, borderColor: colors.surface }]}
                  />
                ))}
              </View>
            ) : (
              <Lock size={14} color={colors.textTertiary} />
            )}
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.gridCard,
          { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.gridHeader, { backgroundColor: themeColor + "10" }]}>
          <View style={[styles.emojiContainer, { backgroundColor: themeColor + "20" }]}>
            <Text style={styles.gridEmoji}>{wishlist.emoji}</Text>
          </View>
          {wishlist.isShared && (
            <View style={[styles.sharedBadge, { backgroundColor: colors.primary + "20" }]}>
              <Users size={10} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.gridBody}>
          <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={1}>
            {wishlist.title}
          </Text>
          <View style={styles.gridMetaRow}>
            <ShoppingBag size={11} color={colors.textTertiary} />
            <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>
              {wishlist.items.length} {wishlist.items.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {wishlist.items.length > 0 && (
            <View style={[styles.gridProgress, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={[styles.gridProgressFill, { width: `${progress * 100}%`, backgroundColor: themeColor }]} />
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  gridCard: {
    width: 160,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  gridHeader: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: "flex-start",
    position: "relative",
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  gridEmoji: {
    fontSize: 24,
  },
  sharedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  gridBody: {
    padding: 14,
    paddingTop: 10,
    gap: 4,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  gridMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gridSubtitle: {
    fontSize: 12,
  },
  gridProgress: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 6,
  },
  gridProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  rowEmoji: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rowEmojiText: {
    fontSize: 22,
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowSubtitle: {
    fontSize: 13,
  },
  rowSharedDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rowSharedText: {
    fontSize: 11,
  },
  rowProgress: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
    marginTop: 4,
  },
  rowProgressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  collaboratorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
});
