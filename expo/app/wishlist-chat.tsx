import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Send,
  Gift,
  X,
  Check,
  ShieldCheck,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppColors } from "@/hooks/useColorScheme";
import {
  useWishlistById,
  useWishlistContext,
  useWishlistMessages,
  useItemAssignments,
} from "@/providers/WishlistProvider";
import { useLocation } from "@/providers/LocationProvider";

const appLogo = require("@/assets/images/logo.png");

function formatChatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

function formatDateSeparator(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WishlistChatScreen() {
  const colors = useAppColors();
  const { format: formatPrice } = useLocation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const wishlist = useWishlistById(id ?? "");
  const { user, sendMessage, assignItem, assignments, refreshChat } = useWishlistContext();
  const messages = useWishlistMessages(id ?? "");
  const itemAssignments = useItemAssignments(id ?? "");

  const [text, setText] = useState("");
  const [showClaimPanel, setShowClaimPanel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const claimPanelAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshChat();
    setTimeout(() => setRefreshing(false), 1200);
  }, [refreshChat]);

  const isOwner = wishlist?.collaborators.find((c) => c.id === user.id)?.role === "owner";

  useEffect(() => {
    Animated.timing(claimPanelAnim, {
      toValue: showClaimPanel ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [showClaimPanel, claimPanelAnim]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 200);
    return () => clearTimeout(timer);
  }, [messages.length]);

  if (!wishlist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48 }}>{"💬"}</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Chat not found</Text>
        </View>
      </View>
    );
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(wishlist.id, trimmed);
    setText("");
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleClaimItem = (productId: string, productTitle: string) => {
    const alreadyClaimed = assignments.some(
      (a) => a.wishlistId === wishlist.id && a.productId === productId
    );
    if (alreadyClaimed) {
      Alert.alert("Already Claimed", "This item has already been claimed by someone.");
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    assignItem(wishlist.id, productId, productTitle);
    setShowClaimPanel(false);
  };

  const getItemAssignment = (productId: string) => {
    return itemAssignments.find((a) => a.productId === productId);
  };

  let lastDateStr = "";

  const claimPanelHeight = claimPanelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(wishlist.items.length * 80 + 80, 320)],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surfaceSecondary }]}>
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <View style={[styles.chatEmoji, { backgroundColor: wishlist.color + "18" }]}>
            <Text style={{ fontSize: 18 }}>{wishlist.emoji}</Text>
          </View>
          <View>
            <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>
              {wishlist.title}
            </Text>
            <Text style={[styles.chatMembers, { color: colors.textTertiary }]}>
              {wishlist.collaborators.length} members
            </Text>
          </View>
        </View>
        <Image source={appLogo} style={styles.topBarLogo} contentFit="contain" />
      </View>

      {isOwner && (
        <View style={[styles.ownerNotice, { backgroundColor: colors.primaryFaded, borderColor: colors.primary + "30" }]}>
          <ShieldCheck size={14} color={colors.primary} />
          <Text style={[styles.ownerNoticeText, { color: colors.primary }]}>
            Gift assignments are hidden from you to keep the surprise!
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {messages.length === 0 ? (
            <View style={styles.chatEmpty}>
              <Image source={appLogo} style={styles.chatEmptyLogo} contentFit="contain" />
              <Text style={[styles.chatEmptyTitle, { color: colors.text }]}>Start the conversation</Text>
              <Text style={[styles.chatEmptySubtitle, { color: colors.textSecondary }]}>
                Coordinate with your group about this wishlist
              </Text>
            </View>
          ) : (
            messages.map((msg) => {
              const dateStr = formatDateSeparator(msg.timestamp);
              let showDate = false;
              if (dateStr !== lastDateStr) {
                showDate = true;
                lastDateStr = dateStr;
              }

              const isMe = msg.senderId === user.id;
              const isAssignment = msg.type === "assignment";

              return (
                <View key={msg.id}>
                  {showDate && (
                    <View style={styles.dateSeparator}>
                      <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                      <Text style={[styles.dateText, { color: colors.textTertiary, backgroundColor: colors.background }]}>
                        {dateStr}
                      </Text>
                      <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                    </View>
                  )}

                  {isAssignment ? (
                    <View style={[styles.assignmentBubble, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
                      <Gift size={14} color={colors.success} />
                      <Text style={[styles.assignmentText, { color: colors.success }]}>
                        {isMe ? "You" : msg.senderName} claimed an item
                      </Text>
                      <Text style={[styles.assignmentDetail, { color: colors.textSecondary }]}>
                        {msg.text}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                      {!isMe && (
                        <Image
                          source={{ uri: msg.senderAvatar }}
                          style={styles.msgAvatar}
                        />
                      )}
                      <View style={[styles.msgBubbleWrap, isMe && styles.msgBubbleWrapMe]}>
                        {!isMe && (
                          <Text style={[styles.msgSender, { color: colors.primary }]}>
                            {msg.senderName}
                          </Text>
                        )}
                        <View
                          style={[
                            styles.msgBubble,
                            isMe
                              ? { backgroundColor: colors.primary }
                              : { backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.msgText,
                              { color: isMe ? "#FFFFFF" : colors.text },
                            ]}
                          >
                            {msg.text}
                          </Text>
                        </View>
                        <Text style={[styles.msgTime, { color: colors.textTertiary }, isMe && styles.msgTimeMe]}>
                          {formatChatTime(msg.timestamp)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <Animated.View style={[
          styles.claimPanel,
          {
            height: claimPanelHeight,
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            overflow: "hidden",
          },
        ]}>
          <View style={styles.claimPanelHeader}>
            <View style={styles.claimPanelTitleRow}>
              <Gift size={16} color={colors.primary} />
              <Text style={[styles.claimPanelTitle, { color: colors.text }]}>Claim an Item</Text>
            </View>
            <Pressable onPress={() => setShowClaimPanel(false)}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
          <Text style={[styles.claimPanelSubtitle, { color: colors.textSecondary }]}>
            {"The wishlist owner won't see your claim"}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {wishlist.items.map((item) => {
              const assignment = getItemAssignment(item.id);
              const isClaimed = !!assignment;
              const isClaimedByMe = assignment?.assignedTo === user.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => !isClaimed && handleClaimItem(item.id, item.title)}
                  style={[
                    styles.claimItem,
                    { borderColor: colors.borderLight, opacity: isClaimed && !isClaimedByMe ? 0.5 : 1 },
                  ]}
                >
                  <Image source={{ uri: item.image }} style={styles.claimItemImage} contentFit="cover" />
                  <View style={styles.claimItemContent}>
                    <Text style={[styles.claimItemTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.claimItemPrice, { color: colors.primary }]}>
                      {formatPrice(item.price, item.currency)}
                    </Text>
                  </View>
                  {isClaimed ? (
                    <View style={[styles.claimedBadge, { backgroundColor: colors.success + "15" }]}>
                      <Check size={12} color={colors.success} />
                      <Text style={[styles.claimedText, { color: colors.success }]}>
                        {isClaimedByMe ? "You" : assignment?.assignedToName}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.claimBtn, { backgroundColor: colors.primaryFaded }]}>
                      <Gift size={14} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.borderLight, paddingBottom: insets.bottom + 8 }]}>
          {!isOwner && (
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowClaimPanel(!showClaimPanel);
              }}
              style={[styles.claimToggle, { backgroundColor: showClaimPanel ? colors.primary : colors.primaryFaded }]}
            >
              <Gift size={18} color={showClaimPanel ? "#FFFFFF" : colors.primary} />
            </Pressable>
          )}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.textInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
            multiline
            maxLength={500}
            onFocus={() => {
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
            }}
          />
          <Pressable
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.surfaceSecondary }]}
          >
            <Send size={18} color={text.trim() ? "#FFFFFF" : colors.textTertiary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chatEmoji: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  chatMembers: {
    fontSize: 12,
  },
  topBarLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  ownerNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  ownerNoticeText: {
    fontSize: 12,
    fontWeight: "500" as const,
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  chatEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 60,
  },
  chatEmptyLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  chatEmptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  chatEmptySubtitle: {
    fontSize: 13,
    textAlign: "center" as const,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600" as const,
    paddingHorizontal: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
    alignItems: "flex-end",
  },
  messageRowMe: {
    flexDirection: "row-reverse",
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  msgBubbleWrap: {
    maxWidth: "75%",
    gap: 3,
  },
  msgBubbleWrapMe: {
    alignItems: "flex-end",
  },
  msgSender: {
    fontSize: 12,
    fontWeight: "600" as const,
    marginLeft: 4,
    marginBottom: 1,
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 10,
    marginLeft: 4,
  },
  msgTimeMe: {
    marginRight: 4,
    marginLeft: 0,
  },
  assignmentBubble: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  assignmentText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  assignmentDetail: {
    fontSize: 12,
  },
  claimPanel: {
    borderTopWidth: 1,
  },
  claimPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  claimPanelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  claimPanelTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  claimPanelSubtitle: {
    fontSize: 12,
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 10,
  },
  claimItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
  },
  claimItemImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  claimItemContent: {
    flex: 1,
    gap: 2,
  },
  claimItemTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  claimItemPrice: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  claimedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  claimedText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  claimBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  claimToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
});
