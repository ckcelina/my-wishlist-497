import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { Wishlist } from "@/types";

const EMOJIS = ["🎁", "💻", "👗", "🏠", "🎮", "📚", "✨", "🎂", "🏖️", "🎄", "💍", "🧸"];
const COLORS = ["#8032ee", "#4c2090", "#36204e", "#E91E63", "#FF9800", "#4CAF50", "#2196F3", "#00BCD4"];

export default function CreateListScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addWishlist, user } = useWishlistContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎁");
  const [selectedColor, setSelectedColor] = useState("#6B2FA0");

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please give your wishlist a name.");
      return;
    }

    const newList: Wishlist = {
      id: `w_${Date.now()}`,
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
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      items: [],
    };

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addWishlist(newList);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}>
          <X size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.previewCard, { backgroundColor: selectedColor + "18" }]}>
          <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
          <Text style={[styles.previewTitle, { color: colors.text }]}>
            {title || "My New List"}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>LIST NAME</Text>
          <TextInput
            placeholder="e.g. Birthday Gift Ideas"
            placeholderTextColor={colors.textTertiary}
            style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            maxLength={40}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION</Text>
          <TextInput
            placeholder="What's this list for?"
            placeholderTextColor={colors.textTertiary}
            style={[styles.textInput, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>ICON</Text>
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
                    backgroundColor: selectedEmoji === emoji ? colors.primaryFaded : colors.surface,
                    borderColor: selectedEmoji === emoji ? colors.primary : colors.borderLight,
                  },
                ]}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>COLOR</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedColor(color);
                }}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 3 : 0,
                    borderColor: colors.text,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleCreate}
          style={[styles.createButton, { backgroundColor: colors.primary }]}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Wishlist</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  previewCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    marginBottom: 28,
    gap: 10,
  },
  previewEmoji: {
    fontSize: 48,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  formGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.8,
    marginBottom: 10,
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
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emojiOption: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  emojiText: {
    fontSize: 26,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
