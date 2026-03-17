import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  Bell,
} from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";
import { Notification } from "@/types";

function getNotificationIcon(type: Notification["type"], color: string) {
  const size = 18;
  switch (type) {
    case "price_drop":
      return <TrendingDown size={size} color="#4CAF50" />;
    case "shared_list":
      return <Users size={size} color={color} />;
    case "collaborator":
      return <ShoppingCart size={size} color="#FF9800" />;
    case "product_update":
      return <Package size={size} color="#2196F3" />;
    default:
      return <Bell size={size} color={color} />;
  }
}

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

export default function NotificationsScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead, unreadCount } = useWishlistContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            We'll notify you about price drops, shared list activity, and more
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => markNotificationRead(notification.id)}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: notification.isRead ? colors.surface : colors.primaryFaded,
                  borderColor: notification.isRead ? colors.borderLight : colors.primary + "30",
                },
              ]}
            >
              {!notification.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
              <View style={styles.notificationRow}>
                {notification.image ? (
                  <Image
                    source={{ uri: notification.image }}
                    style={styles.notificationImage}
                  />
                ) : (
                  <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                    {getNotificationIcon(notification.type, colors.primary)}
                  </View>
                )}
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        { color: colors.text, fontWeight: notification.isRead ? ("500" as const) : ("700" as const) },
                      ]}
                    >
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
                      {formatTimeAgo(notification.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                    {notification.message}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationRow: {
    flexDirection: "row",
    gap: 12,
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 15,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
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
