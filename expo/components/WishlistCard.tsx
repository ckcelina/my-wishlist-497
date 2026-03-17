import React, { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { Image } from "expo-image";
import { Users, Lock } from "lucide-react-native";
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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  if (variant === "row") {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.rowCard,
            { backgroundColor: colors.surface, borderColor: colors.borderLight, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={[styles.rowEmoji, { backgroundColor: wishlist.color + "18" }]}>
            <Text style={styles.emojiText}>{wishlist.emoji}</Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
              {wishlist.title}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              {wishlist.itemCount} items
            </Text>
          </View>
          <View style={styles.rowRight}>
            {wishlist.isShared ? (
              <View style={styles.collaboratorRow}>
                {wishlist.collaborators.slice(0, 3).map((c, i) => (
                  <Image
                    key={c.id}
                    source={{ uri: c.avatar }}
                    style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0, borderColor: colors.surface }]}
                  />
                ))}
              </View>
            ) : (
              <Lock size={16} color={colors.textTertiary} />
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
        <View style={[styles.emojiContainer, { backgroundColor: wishlist.color + "18" }]}>
          <Text style={styles.gridEmoji}>{wishlist.emoji}</Text>
        </View>
        <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={1}>
          {wishlist.title}
        </Text>
        <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>
          {wishlist.itemCount} {wishlist.itemCount === 1 ? "item" : "items"}
        </Text>
        <View style={styles.gridFooter}>
          {wishlist.isShared ? (
            <View style={styles.sharedIndicator}>
              <Users size={12} color={colors.primary} />
              <Text style={[styles.sharedText, { color: colors.primary }]}>
                {wishlist.collaborators.length}
              </Text>
            </View>
          ) : (
            <Lock size={12} color={colors.textTertiary} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  gridCard: {
    width: 155,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  gridEmoji: {
    fontSize: 24,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  gridSubtitle: {
    fontSize: 12,
  },
  gridFooter: {
    marginTop: 4,
  },
  sharedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sharedText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  rowEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    fontSize: 22,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  rowSubtitle: {
    fontSize: 13,
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
