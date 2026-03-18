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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Check, ChevronDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { Wishlist } from "@/types";

const EMOJIS = [
  "🎁", "💻", "👗", "🏠", "🎮", "📚", "✨", "🎂",
  "🏖️", "🎄", "💍", "🧸", "👟", "🎧", "📱", "🛍️",
  "💄", "🎨", "🧳", "🍳", "🪴", "🎵", "⌚", "🎯",
];

const THEME_COLORS = [
  { color: "#FF6B6B", label: "Coral" },
  { color: "#4ECDC4", label: "Teal" },
  { color: "#45B7D1", label: "Sky" },
  { color: "#96CEB4", label: "Sage" },
  { color: "#FFEAA7", label: "Gold" },
  { color: "#DDA0DD", label: "Plum" },
  { color: "#FF8C42", label: "Tangerine" },
  { color: "#6C5CE7", label: "Iris" },
  { color: "#E17055", label: "Terracotta" },
  { color: "#00B894", label: "Emerald" },
  { color: "#FD79A8", label: "Rose" },
  { color: "#636E72", label: "Slate" },
];

export default function CreateListScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addWishlist, user } = useWishlistContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎁");
  const [selectedColor, setSelectedColor] = useState("#4ECDC4");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.92, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please give your wishlist a name.");
      return;
    }

    setIsCreating(true);
    animatePress(buttonScale);

    try {
      const newList: Wishlist = {
        id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        description: description.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
        itemCount: 0,
        collaborators: [
          {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: "owner",
          },
        ],
        isShared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addWishlist(newList);
      console.log("[CreateList] Wishlist created:", newList.id, newList.title);
      router.back();
    } catch (err) {
      console.error("[CreateList] Error creating wishlist:", err);
      Alert.alert("Error", "Failed to create wishlist. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }, [title, description, selectedEmoji, selectedColor, user, addWishlist, router, animatePress, buttonScale]);

  const canCreate = title.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: colors.surfaceSecondary }]}
          testID="close-create-list"
        >
          <X size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Wishlist</Text>
        <Pressable
          onPress={() => void handleCreate()}
          disabled={!canCreate || isCreating}
          style={[
            styles.headerBtn,
            {
              backgroundColor: canCreate ? selectedColor : colors.surfaceSecondary,
              opacity: canCreate && !isCreating ? 1 : 0.4,
            },
          ]}
          testID="create-wishlist-btn"
        >
          <Check size={20} color={canCreate ? "#FFFFFF" : colors.textTertiary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              animatePress(emojiScale);
              setShowEmojiPicker(!showEmojiPicker);
            }}
            style={styles.previewArea}
          >
            <Animated.View
              style={[
                styles.previewCard,
                {
                  backgroundColor: selectedColor + "15",
                  borderColor: selectedColor + "30",
                  transform: [{ scale: emojiScale }],
                },
              ]}
            >
              <View style={[styles.bigEmojiCircle, { backgroundColor: selectedColor + "20" }]}>
                <Text style={styles.bigEmoji}>{selectedEmoji}</Text>
              </View>
              <Text style={[styles.previewTitle, { color: colors.text }]}>
                {title || "Untitled List"}
              </Text>
              {description ? (
                <Text style={[styles.previewDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                  {description}
                </Text>
              ) : null}
              <View style={styles.tapHintRow}>
                <ChevronDown size={14} color={colors.textTertiary} />
                <Text style={[styles.tapHint, { color: colors.textTertiary }]}>
                  Tap to {showEmojiPicker ? "hide" : "change"} icon
                </Text>
              </View>
            </Animated.View>
          </Pressable>

          {showEmojiPicker && (
            <View style={[styles.emojiPickerCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CHOOSE ICON</Text>
              <View style={styles.emojiGrid}>
                {EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedEmoji(emoji);
                    }}
                    style={[
                      styles.emojiOption,
                      {
                        backgroundColor: selectedEmoji === emoji ? selectedColor + "20" : "transparent",
                        borderColor: selectedEmoji === emoji ? selectedColor : "transparent",
                      },
                    ]}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.formSection}>
            <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>NAME</Text>
              <TextInput
                placeholder="Birthday Gift Ideas, Travel Gear..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.nameInput, { color: colors.text }]}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
                autoFocus
                testID="wishlist-name-input"
              />
              <View style={[styles.inputDivider, { backgroundColor: colors.borderLight }]} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 14 }]}>DESCRIPTION</Text>
              <TextInput
                placeholder="What's this list about? (optional)"
                placeholderTextColor={colors.textTertiary}
                style={[styles.descInput, { color: colors.text }]}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={200}
                testID="wishlist-desc-input"
              />
            </View>

            {title.length > 0 && (
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {title.length}/50
              </Text>
            )}
          </View>

          <View style={styles.colorSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>THEME COLOR</Text>
            <View style={styles.colorGrid}>
              {THEME_COLORS.map(({ color }) => (
                <Pressable
                  key={color}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedColor(color);
                  }}
                  style={[styles.colorOptionWrap]}
                >
                  <View
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 0,
                        borderColor: colors.text,
                      },
                    ]}
                  >
                    {selectedColor === color && (
                      <Check size={16} color="#FFFFFF" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              onPress={() => void handleCreate()}
              disabled={!canCreate || isCreating}
              style={[
                styles.createButton,
                {
                  backgroundColor: canCreate ? selectedColor : colors.surfaceSecondary,
                  opacity: canCreate && !isCreating ? 1 : 0.5,
                },
              ]}
              testID="create-wishlist-submit"
            >
              <Text style={[styles.createButtonText, { color: canCreate ? "#FFFFFF" : colors.textTertiary }]}>
                {isCreating ? "Creating..." : "Create Wishlist"}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  previewArea: {
    marginBottom: 20,
  },
  previewCard: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  bigEmojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  bigEmoji: {
    fontSize: 36,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },
  previewDesc: {
    fontSize: 14,
    textAlign: "center" as const,
  },
  tapHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tapHint: {
    fontSize: 12,
  },
  emojiPickerCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  inputCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 17,
    fontWeight: "500" as const,
    paddingVertical: 4,
  },
  inputDivider: {
    height: 1,
    marginTop: 14,
  },
  descInput: {
    fontSize: 15,
    paddingVertical: 4,
    minHeight: 44,
  },
  charCount: {
    fontSize: 11,
    textAlign: "right" as const,
    marginTop: 8,
    marginRight: 4,
  },
  colorSection: {
    marginBottom: 28,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOptionWrap: {
    alignItems: "center",
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
  },
});
