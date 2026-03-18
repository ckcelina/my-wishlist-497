import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";

const appLogo = require("@/assets/images/logo.png");

const ChatSeparator = () => <View style={{ height: 10 }} />;

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export default function ChatsScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wishlists, chatMessages, user } = useWishlistContext();

  const sharedWishlists = wishlists.filter((w) => w.isShared);

  const getLastMessage = (wishlistId: string) => {
    const wishlist = wishlists.find((w) => w.id === wishlistId);
    const isOwner = wishlist?.collaborators.find((c) => c.id === user.id)?.role === "owner";
    const msgs = chatMessages
      .filter((m) => m.wishlistId === wishlistId)
      .filter((m) => {
        if (isOwner && m.type === "assignment") return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return msgs[0] ?? null;
  };

  const getMessageCount = (wishlistId: string) => {
    return chatMessages.filter((m) => m.wishlistId === wishlistId && m.senderId !== user.id && m.type !== "assignment").length;
  };

  const sortedWishlists = [...sharedWishlists].sort((a, b) => {
    const lastA = getLastMessage(a.id);
    const lastB = getLastMessage(b.id);
    if (!lastA && !lastB) return 0;
    if (!lastA) return 1;
    if (!lastB) return -1;
    return new Date(lastB.timestamp).getTime() - new Date(lastA.timestamp).getTime();
  });

  const renderChatThread = ({ item }: { item: typeof sharedWishlists[0] }) => {
    const lastMessage = getLastMessage(item.id);
    const msgCount = getMessageCount(item.id);

    return (
      <Pressable
        onPress={() => router.push({ pathname: "/wishlist-chat", params: { id: item.id } })}
        style={[styles.threadCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
        testID={`chat-thread-${item.id}`}
      >
        <View style={[styles.threadEmoji, { backgroundColor: item.color + "18" }]}>
          <Text style={styles.threadEmojiText}>{item.emoji}</Text>
        </View>
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={[styles.threadTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {lastMessage && (
              <Text style={[styles.threadTime, { color: colors.textTertiary }]}>
                {formatTimeAgo(lastMessage.timestamp)}
              </Text>
            )}
          </View>
          <View style={styles.threadFooter}>
            <Text style={[styles.threadPreview, { color: colors.textSecondary }]} numberOfLines={1}>
              {lastMessage
                ? `${lastMessage.senderId === user.id ? "You" : lastMessage.senderName}: ${lastMessage.text}`
                : "Start the conversation..."}
            </Text>
            {msgCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>{msgCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.threadMembers}>
            {item.collaborators.slice(0, 4).map((c, i) => (
              <Image
                key={c.id}
                source={{ uri: c.avatar }}
                style={[styles.memberAvatar, { marginLeft: i > 0 ? -6 : 0, borderColor: colors.surface }]}
              />
            ))}
            <Text style={[styles.memberCount, { color: colors.textTertiary }]}>
              {item.collaborators.length} members
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textTertiary} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <Image source={appLogo} style={styles.headerLogo} contentFit="contain" />
          <Text style={[styles.title, { color: colors.text }]}>Group Chats</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Coordinate with friends & family on shared wishlists
        </Text>
      </View>

      {sharedWishlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={appLogo} style={styles.emptyLogo} contentFit="contain" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No shared wishlists yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Share a wishlist to start group chats with friends and family
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedWishlists}
          keyExtractor={(item) => item.id}
          renderItem={renderChatThread}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ChatSeparator}
        />
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
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
  },
  subtitle: {
    fontSize: 14,
    marginLeft: 42,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  threadCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  threadEmoji: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  threadEmojiText: {
    fontSize: 26,
  },
  threadContent: {
    flex: 1,
    gap: 4,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    flex: 1,
  },
  threadTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  threadFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  threadPreview: {
    fontSize: 13,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  threadMembers: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  memberCount: {
    fontSize: 11,
    marginLeft: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center" as const,
    lineHeight: 20,
  },
});
