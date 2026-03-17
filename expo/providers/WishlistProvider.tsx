import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Product, Wishlist, Notification, UserProfile, ChatMessage, ItemAssignment } from "@/types";
import {
  mockWishlists,
  mockNotifications,
  mockUser,
  mockProducts,
  trendingProducts,
  mockChatMessages,
  mockAssignments,
} from "@/mocks/data";

const WISHLISTS_KEY = "wishlists_data";
const NOTIFICATIONS_KEY = "notifications_data";
const CHAT_KEY = "chat_messages_v2";
const ASSIGNMENTS_KEY = "item_assignments_v2";

export const [WishlistProvider, useWishlistContext] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [user] = useState<UserProfile>(mockUser);

  const wishlistsQuery = useQuery({
    queryKey: ["wishlists"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(WISHLISTS_KEY);
      if (stored) {
        return JSON.parse(stored) as Wishlist[];
      }
      await AsyncStorage.setItem(WISHLISTS_KEY, JSON.stringify(mockWishlists));
      return mockWishlists;
    },
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        return JSON.parse(stored) as Notification[];
      }
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(mockNotifications));
      return mockNotifications;
    },
  });

  const chatQuery = useQuery({
    queryKey: ["chatMessages"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHAT_KEY);
      if (stored) {
        return JSON.parse(stored) as ChatMessage[];
      }
      await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(mockChatMessages));
      return mockChatMessages;
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ASSIGNMENTS_KEY);
      if (stored) {
        return JSON.parse(stored) as ItemAssignment[];
      }
      await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(mockAssignments));
      return mockAssignments;
    },
  });

  useEffect(() => {
    if (wishlistsQuery.data) setWishlists(wishlistsQuery.data);
  }, [wishlistsQuery.data]);

  useEffect(() => {
    if (notificationsQuery.data) setNotifications(notificationsQuery.data);
  }, [notificationsQuery.data]);

  useEffect(() => {
    if (chatQuery.data) setChatMessages(chatQuery.data);
  }, [chatQuery.data]);

  useEffect(() => {
    if (assignmentsQuery.data) setAssignments(assignmentsQuery.data);
  }, [assignmentsQuery.data]);

  const syncWishlists = useMutation({
    mutationFn: async (updated: Wishlist[]) => {
      await AsyncStorage.setItem(WISHLISTS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  const syncChat = useMutation({
    mutationFn: async (updated: ChatMessage[]) => {
      await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(updated));
      return updated;
    },
  });

  const syncAssignments = useMutation({
    mutationFn: async (updated: ItemAssignment[]) => {
      await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(updated));
      return updated;
    },
  });

  const addWishlist = useCallback(
    (wishlist: Wishlist) => {
      const updated = [wishlist, ...wishlists];
      setWishlists(updated);
      syncWishlists.mutate(updated);
    },
    [wishlists, syncWishlists]
  );

  const addProductToWishlist = useCallback(
    (wishlistId: string, product: Product) => {
      const updated = wishlists.map((w) => {
        if (w.id === wishlistId) {
          const exists = w.items.some((item) => item.id === product.id);
          if (exists) return w;
          return {
            ...w,
            items: [...w.items, product],
            itemCount: w.itemCount + 1,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return w;
      });
      setWishlists(updated);
      syncWishlists.mutate(updated);
    },
    [wishlists, syncWishlists]
  );

  const removeProductFromWishlist = useCallback(
    (wishlistId: string, productId: string) => {
      const updated = wishlists.map((w) => {
        if (w.id === wishlistId) {
          return {
            ...w,
            items: w.items.filter((item) => item.id !== productId),
            itemCount: Math.max(0, w.itemCount - 1),
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return w;
      });
      setWishlists(updated);
      syncWishlists.mutate(updated);
    },
    [wishlists, syncWishlists]
  );

  const togglePurchased = useCallback(
    (wishlistId: string, productId: string) => {
      const updated = wishlists.map((w) => {
        if (w.id === wishlistId) {
          return {
            ...w,
            items: w.items.map((item) =>
              item.id === productId ? { ...item, isPurchased: !item.isPurchased } : item
            ),
          };
        }
        return w;
      });
      setWishlists(updated);
      syncWishlists.mutate(updated);
    },
    [wishlists, syncWishlists]
  );

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updated);
      void AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    },
    [notifications]
  );

  const sendMessage = useCallback(
    (wishlistId: string, text: string, type: ChatMessage["type"] = "message", assignedItemId?: string) => {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        wishlistId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        text,
        timestamp: new Date().toISOString(),
        type,
        assignedItemId,
        assignedTo: type === "assignment" ? user.id : undefined,
      };
      const updated = [...chatMessages, newMsg];
      setChatMessages(updated);
      syncChat.mutate(updated);
    },
    [chatMessages, user, syncChat]
  );

  const assignItem = useCallback(
    (wishlistId: string, productId: string, productTitle: string) => {
      const newAssignment: ItemAssignment = {
        productId,
        assignedTo: user.id,
        assignedToName: user.name,
        assignedBy: user.id,
        wishlistId,
        timestamp: new Date().toISOString(),
      };
      const updatedAssignments = [...assignments, newAssignment];
      setAssignments(updatedAssignments);
      syncAssignments.mutate(updatedAssignments);
      sendMessage(wishlistId, `I'll get "${productTitle}" \u{1F381}`, "assignment", productId);
    },
    [assignments, user, syncAssignments, sendMessage]
  );

  const unassignItem = useCallback(
    (wishlistId: string, productId: string) => {
      const updatedAssignments = assignments.filter(
        (a) => !(a.wishlistId === wishlistId && a.productId === productId && a.assignedTo === user.id)
      );
      setAssignments(updatedAssignments);
      syncAssignments.mutate(updatedAssignments);
    },
    [assignments, user, syncAssignments]
  );

  const toggleShareWishlist = useCallback(
    (wishlistId: string) => {
      const updated = wishlists.map((w) => {
        if (w.id === wishlistId) {
          return { ...w, isShared: !w.isShared };
        }
        return w;
      });
      setWishlists(updated);
      syncWishlists.mutate(updated);
    },
    [wishlists, syncWishlists]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const myLists = useMemo(
    () => wishlists.filter((w) => !w.isShared),
    [wishlists]
  );

  const sharedLists = useMemo(
    () => wishlists.filter((w) => w.isShared),
    [wishlists]
  );

  const unreadChatCount = useMemo(() => {
    const sharedIds = new Set(wishlists.filter((w) => w.isShared).map((w) => w.id));
    const uniqueWishlists = new Set<string>();
    chatMessages.forEach((m) => {
      if (sharedIds.has(m.wishlistId) && m.senderId !== user.id && m.type !== "assignment") {
        uniqueWishlists.add(m.wishlistId);
      }
    });
    return uniqueWishlists.size;
  }, [chatMessages, wishlists, user.id]);

  return useMemo(
    () => ({
      wishlists,
      myLists,
      sharedLists,
      notifications,
      unreadCount,
      user,
      allProducts: mockProducts,
      trendingProducts,
      chatMessages,
      assignments,
      unreadChatCount,
      isLoading: wishlistsQuery.isLoading,
      addWishlist,
      addProductToWishlist,
      removeProductFromWishlist,
      togglePurchased,
      markNotificationRead,
      sendMessage,
      assignItem,
      unassignItem,
      toggleShareWishlist,
    }),
    [
      wishlists, myLists, sharedLists, notifications, unreadCount, user,
      chatMessages, assignments, unreadChatCount,
      wishlistsQuery.isLoading,
      addWishlist, addProductToWishlist, removeProductFromWishlist,
      togglePurchased, markNotificationRead,
      sendMessage, assignItem, unassignItem, toggleShareWishlist,
    ]
  );
});

export function useWishlistById(id: string) {
  const { wishlists } = useWishlistContext();
  return useMemo(() => wishlists.find((w) => w.id === id), [wishlists, id]);
}

export function useWishlistMessages(wishlistId: string) {
  const { chatMessages, user, wishlists } = useWishlistContext();
  return useMemo(() => {
    const wishlist = wishlists.find((w) => w.id === wishlistId);
    const isOwner = wishlist?.collaborators.find((c) => c.id === user.id)?.role === "owner";
    return chatMessages
      .filter((m) => m.wishlistId === wishlistId)
      .filter((m) => {
        if (isOwner && m.type === "assignment") return false;
        return true;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [chatMessages, wishlistId, user, wishlists]);
}

export function useItemAssignments(wishlistId: string) {
  const { assignments, user, wishlists } = useWishlistContext();
  return useMemo(() => {
    const wishlist = wishlists.find((w) => w.id === wishlistId);
    const isOwner = wishlist?.collaborators.find((c) => c.id === user.id)?.role === "owner";
    if (isOwner) {
      return assignments
        .filter((a) => a.wishlistId === wishlistId)
        .map((a) => ({ ...a, assignedToName: "Someone", assignedTo: "hidden" }));
    }
    return assignments.filter((a) => a.wishlistId === wishlistId);
  }, [assignments, wishlistId, user, wishlists]);
}
