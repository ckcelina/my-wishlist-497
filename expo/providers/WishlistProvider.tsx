import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Product, Wishlist, Notification, UserProfile, ChatMessage, ItemAssignment } from "@/types";
import {
  mockWishlists,
  mockNotifications,
  mockProducts,
  mockChatMessages,
  mockAssignments,
} from "@/mocks/data";
import { useAuth } from "@/providers/AuthProvider";
import * as db from "@/lib/database";

const WISHLISTS_KEY = "wishlists_data";
const NOTIFICATIONS_KEY = "notifications_data";
const CHAT_KEY = "chat_messages_v2";
const ASSIGNMENTS_KEY = "item_assignments_v2";
const RECENTLY_VIEWED_KEY = "recently_viewed_v1";

export const [WishlistProvider, useWishlistContext] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { user: authUser, profile } = useAuth();

  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const user = useMemo<UserProfile>(() => {
    const base = {
      country: "",
      currency: "",
      wishlistCount: 0,
      savedItems: 0,
      sharedLists: 0,
    };
    if (profile && authUser) {
      return {
        ...base,
        id: authUser.id,
        name: profile.full_name || authUser.email?.split("@")[0] || "User",
        email: profile.email || authUser.email || "",
        avatar: profile.avatar_url || "",
      };
    }
    if (authUser) {
      return {
        ...base,
        id: authUser.id,
        name: authUser.user_metadata?.full_name as string || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        avatar: "",
      };
    }
    return {
      ...base,
      id: "guest",
      name: "Guest",
      email: "",
      avatar: "",
    };
  }, [authUser, profile]);

  const wishlistsQuery = useQuery({
    queryKey: ["wishlists", user.id],
    queryFn: async () => {
      if (user.id === "guest") {
        const stored = await AsyncStorage.getItem(WISHLISTS_KEY);
        if (stored) return JSON.parse(stored) as Wishlist[];
        await AsyncStorage.setItem(WISHLISTS_KEY, JSON.stringify(mockWishlists));
        return mockWishlists;
      }

      try {
        const supaWishlists = await db.fetchUserWishlists(user.id);
        if (supaWishlists.length > 0) {
          return supaWishlists;
        }

        const stored = await AsyncStorage.getItem(WISHLISTS_KEY);
        if (stored) {
          const local = JSON.parse(stored) as Wishlist[];
          if (local.length > 0) return local;
        }

        return [];
      } catch (err) {
        console.log("[WishlistProvider] Supabase fetch failed, using local:", err);
        const stored = await AsyncStorage.getItem(WISHLISTS_KEY);
        if (stored) return JSON.parse(stored) as Wishlist[];
        return [];
      }
    },
    enabled: user.id !== "",
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

  const sharedWishlistIds = useMemo(
    () => wishlists.filter((w) => w.isShared).map((w) => w.id),
    [wishlists]
  );

  const chatQuery = useQuery({
    queryKey: ["chatMessages", user.id, sharedWishlistIds],
    queryFn: async () => {
      if (user.id === "guest") {
        const stored = await AsyncStorage.getItem(CHAT_KEY);
        if (stored) return JSON.parse(stored) as ChatMessage[];
        await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(mockChatMessages));
        return mockChatMessages;
      }

      try {
        if (sharedWishlistIds.length > 0) {
          const msgs = await db.fetchChatMessages(sharedWishlistIds);
          console.log(`[WishlistProvider] Fetched ${msgs.length} chat messages from Supabase`);
          return msgs;
        }
        return [];
      } catch (err) {
        console.log("[WishlistProvider] Chat fetch failed:", err);
        const stored = await AsyncStorage.getItem(CHAT_KEY);
        if (stored) return JSON.parse(stored) as ChatMessage[];
        return [];
      }
    },
    enabled: user.id !== "" && !wishlistsQuery.isLoading,
    refetchInterval: 10000,
  });

  const assignmentsQuery = useQuery({
    queryKey: ["assignments", user.id, sharedWishlistIds],
    queryFn: async () => {
      if (user.id === "guest") {
        const stored = await AsyncStorage.getItem(ASSIGNMENTS_KEY);
        if (stored) return JSON.parse(stored) as ItemAssignment[];
        await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(mockAssignments));
        return mockAssignments;
      }

      try {
        if (sharedWishlistIds.length > 0) {
          const result = await db.fetchItemAssignments(sharedWishlistIds);
          console.log(`[WishlistProvider] Fetched ${result.length} assignments from Supabase`);
          return result;
        }
        return [];
      } catch (err) {
        console.log("[WishlistProvider] Assignments fetch failed:", err);
        const stored = await AsyncStorage.getItem(ASSIGNMENTS_KEY);
        if (stored) return JSON.parse(stored) as ItemAssignment[];
        return [];
      }
    },
    enabled: user.id !== "" && !wishlistsQuery.isLoading,
    refetchInterval: 10000,
  });

  const recentlyViewedQuery = useQuery({
    queryKey: ["recentlyViewed"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? (JSON.parse(stored) as Product[]) : [];
    },
  });

  useEffect(() => {
    if (recentlyViewedQuery.data) setRecentlyViewed(recentlyViewedQuery.data);
  }, [recentlyViewedQuery.data]);

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

      if (user.id !== "guest") {
        db.createWishlist(user.id, wishlist).then((result) => {
          if (result) {
            console.log("[WishlistProvider] Wishlist saved to Supabase");
          }
        }).catch((err) => {
          console.log("[WishlistProvider] Failed to save wishlist to Supabase:", err);
        });
      }
    },
    [wishlists, syncWishlists, user.id]
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

      if (user.id !== "guest") {
        db.addItemToWishlist(wishlistId, product).catch((err) => {
          console.log("[WishlistProvider] Failed to save item to Supabase:", err);
        });
      }
    },
    [wishlists, syncWishlists, user.id]
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

      if (user.id !== "guest") {
        db.removeItemFromWishlist(wishlistId, productId).catch((err) => {
          console.log("[WishlistProvider] Failed to remove item from Supabase:", err);
        });
      }
    },
    [wishlists, syncWishlists, user.id]
  );

  const togglePurchased = useCallback(
    (wishlistId: string, productId: string) => {
      let newState = false;
      const updated = wishlists.map((w) => {
        if (w.id === wishlistId) {
          return {
            ...w,
            items: w.items.map((item) => {
              if (item.id === productId) {
                newState = !item.isPurchased;
                return { ...item, isPurchased: newState };
              }
              return item;
            }),
          };
        }
        return w;
      });
      setWishlists(updated);
      syncWishlists.mutate(updated);

      if (user.id !== "guest") {
        db.toggleItemPurchased(wishlistId, productId, newState).catch((err) => {
          console.log("[WishlistProvider] Failed to toggle purchased in Supabase:", err);
        });
      }
    },
    [wishlists, syncWishlists, user.id]
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

      if (user.id !== "guest") {
        db.sendChatMessage({
          wishlistId: newMsg.wishlistId,
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          senderAvatar: newMsg.senderAvatar,
          text: newMsg.text,
          timestamp: newMsg.timestamp,
          type: newMsg.type,
          assignedItemId: newMsg.assignedItemId,
          assignedTo: newMsg.assignedTo,
        }).catch((err) => {
          console.log("[WishlistProvider] Failed to send message to Supabase:", err);
        });
      }
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
      sendMessage(wishlistId, `I'll get "${productTitle}" 🎁`, "assignment", productId);

      if (user.id !== "guest") {
        db.createItemAssignment(newAssignment).catch((err) => {
          console.log("[WishlistProvider] Failed to create assignment in Supabase:", err);
        });
      }
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

      if (user.id !== "guest") {
        db.removeItemAssignment(wishlistId, productId, user.id).catch((err) => {
          console.log("[WishlistProvider] Failed to remove assignment from Supabase:", err);
        });
      }
    },
    [assignments, user, syncAssignments]
  );

  const toggleShareWishlist = useCallback(
    (wishlistId: string) => {
      let newShared = false;
      const updated = wishlists.map((w) => {
        if (w.id === wishlistId) {
          newShared = !w.isShared;
          return { ...w, isShared: newShared };
        }
        return w;
      });
      setWishlists(updated);
      syncWishlists.mutate(updated);

      if (user.id !== "guest") {
        db.toggleWishlistShared(wishlistId, newShared).catch((err) => {
          console.log("[WishlistProvider] Failed to toggle share in Supabase:", err);
        });
      }
    },
    [wishlists, syncWishlists, user.id]
  );

  const deleteWishlistById = useCallback(
    (wishlistId: string) => {
      const updated = wishlists.filter((w) => w.id !== wishlistId);
      setWishlists(updated);
      syncWishlists.mutate(updated);

      if (user.id !== "guest") {
        db.deleteWishlist(wishlistId).catch((err) => {
          console.log("[WishlistProvider] Failed to delete wishlist from Supabase:", err);
        });
      }
    },
    [wishlists, syncWishlists, user.id]
  );

  const refreshWishlists = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["wishlists", user.id] });
    void queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    void queryClient.invalidateQueries({ queryKey: ["assignments"] });
  }, [queryClient, user.id]);

  const refreshChat = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    void queryClient.invalidateQueries({ queryKey: ["assignments"] });
  }, [queryClient]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      const updated = [product, ...prev.filter((p) => p.id !== product.id)].slice(0, 10);
      void AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProductInWishlist = useCallback(
    (wishlistId: string, productId: string, updates: Partial<Product>) => {
      const updated = wishlists.map((w) => {
        if (w.id !== wishlistId) return w;
        return {
          ...w,
          items: w.items.map((item) =>
            item.id === productId ? { ...item, ...updates } : item
          ),
          updatedAt: new Date().toISOString().split("T")[0],
        };
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
      deleteWishlistById,
      refreshWishlists,
      refreshChat,
      recentlyViewed,
      addToRecentlyViewed,
      updateProductInWishlist,
    }),
    [
      wishlists, myLists, sharedLists, notifications, unreadCount, user,
      chatMessages, assignments, unreadChatCount,
      wishlistsQuery.isLoading,
      addWishlist, addProductToWishlist, removeProductFromWishlist,
      togglePurchased, markNotificationRead,
      sendMessage, assignItem, unassignItem, toggleShareWishlist,
      deleteWishlistById, refreshWishlists, refreshChat,
      recentlyViewed, addToRecentlyViewed, updateProductInWishlist,
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
