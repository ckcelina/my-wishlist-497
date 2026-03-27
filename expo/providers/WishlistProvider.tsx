import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Product, Wishlist, Notification, UserProfile, ChatMessage, ItemAssignment } from "@/types";
import {
  mockWishlists,
  mockNotifications,
  mockChatMessages,
  mockAssignments,
} from "@/mocks/data";
import { useAuth } from "@/providers/AuthProvider";
import * as db from "@/lib/database";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

const WISHLISTS_KEY = "wishlists_data";
const NOTIFICATIONS_KEY = "notifications_data";
const CHAT_KEY = "chat_messages_v2";
const ASSIGNMENTS_KEY = "item_assignments_v2";
const RECENTLY_VIEWED_KEY = "recently_viewed_v1";
const LAST_READ_KEY = "chat_last_read_v1";

export const [WishlistProvider, useWishlistContext] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { user: authUser, profile } = useAuth();

  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const sharedIdsRef = useRef<string>("");

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
    refetchInterval: 30000,
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
    refetchInterval: 30000,
  });

  const sharedIdsJoined = sharedWishlistIds.join(",");

  useEffect(() => {
    if (user.id === "guest" || sharedWishlistIds.length === 0) {
      if (realtimeChannelRef.current) {
        console.log("[WishlistProvider] Removing realtime channel (no shared wishlists)");
        void supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      return;
    }

    if (sharedIdsRef.current === sharedIdsJoined && realtimeChannelRef.current) {
      return;
    }
    sharedIdsRef.current = sharedIdsJoined;

    if (realtimeChannelRef.current) {
      void supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    console.log("[WishlistProvider] Setting up realtime subscription for", sharedWishlistIds.length, "wishlists");

    const channel = supabase
      .channel(`chat-realtime-${Date.now()}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload: any) => {
          const m = payload.new;
          if (!m) return;
          console.log("[Realtime] New chat_message INSERT:", m.id, "from:", m.sender_name);

          const currentSharedIds = sharedIdsRef.current.split(",");
          if (!currentSharedIds.includes(m.wishlist_id)) return;

          const newMsg: ChatMessage = {
            id: m.id,
            wishlistId: m.wishlist_id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            senderAvatar: m.sender_avatar,
            text: m.text,
            timestamp: m.created_at,
            type: m.type,
            assignedItemId: m.assigned_item_id ?? undefined,
            assignedTo: m.assigned_to ?? undefined,
          };

          setChatMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMsg.id);
            if (exists) return prev;
            const withoutTemp = m.sender_id === user.id
              ? prev.filter((msg) => !(msg.id.startsWith("msg_") && msg.senderId === user.id && msg.text === newMsg.text))
              : prev;
            return [...withoutTemp, newMsg];
          });
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "item_assignments",
        },
        (payload: any) => {
          const a = payload.new;
          if (!a) return;
          console.log("[Realtime] New item_assignment INSERT:", a.id);

          const currentSharedIds = sharedIdsRef.current.split(",");
          if (!currentSharedIds.includes(a.wishlist_id)) return;

          const newAssignment: ItemAssignment = {
            productId: a.product_id,
            assignedTo: a.assigned_to,
            assignedToName: a.assigned_to_name,
            assignedBy: a.assigned_by,
            wishlistId: a.wishlist_id,
            timestamp: a.created_at,
          };

          setAssignments((prev) => {
            const exists = prev.some(
              (x) => x.wishlistId === newAssignment.wishlistId && x.productId === newAssignment.productId && x.assignedTo === newAssignment.assignedTo
            );
            if (exists) return prev;
            return [...prev, newAssignment];
          });
        }
      )
      .subscribe((status: string) => {
        console.log("[Realtime] Subscription status:", status);
      });

    realtimeChannelRef.current = channel;

    return () => {
      console.log("[WishlistProvider] Cleaning up realtime channel");
      if (realtimeChannelRef.current) {
        void supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, sharedIdsJoined]);

  const lastReadQuery = useQuery({
    queryKey: ["lastRead"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(LAST_READ_KEY);
      return stored ? (JSON.parse(stored) as Record<string, string>) : {};
    },
  });

  useEffect(() => {
    if (lastReadQuery.data) setLastReadTimestamps(lastReadQuery.data);
  }, [lastReadQuery.data]);

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
        db.createWishlistWithIdentity(user.id, wishlist, user.name, user.avatar).then((result) => {
          if (result) {
            console.log("[WishlistProvider] Wishlist saved to Supabase with identity");
          }
        }).catch((err) => {
          console.log("[WishlistProvider] Failed to save wishlist to Supabase:", err);
        });
      }
    },
    [wishlists, syncWishlists, user.id, user.name, user.avatar]
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
      const tempId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newMsg: ChatMessage = {
        id: tempId,
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
      setChatMessages((prev) => [...prev, newMsg]);

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
        }).then((result) => {
          if (result) {
            setChatMessages((prev) =>
              prev.map((m) => (m.id === tempId ? { ...m, id: result.id, timestamp: result.timestamp } : m))
            );
            console.log("[WishlistProvider] Message ID synced:", tempId, "->", result.id);
          }
        }).catch((err) => {
          console.log("[WishlistProvider] Failed to send message to Supabase:", err);
          setChatMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: `failed_${tempId}` } : m))
          );
        });
      } else {
        syncChat.mutate([...chatMessages, newMsg]);
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

  const markChatAsRead = useCallback(
    (wishlistId: string) => {
      const now = new Date().toISOString();
      setLastReadTimestamps((prev) => {
        const updated = { ...prev, [wishlistId]: now };
        void AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const getUnreadCountForWishlist = useCallback(
    (wishlistId: string) => {
      const lastRead = lastReadTimestamps[wishlistId];
      return chatMessages.filter(
        (m) =>
          m.wishlistId === wishlistId &&
          m.senderId !== user.id &&
          m.type !== "assignment" &&
          (!lastRead || new Date(m.timestamp).getTime() > new Date(lastRead).getTime())
      ).length;
    },
    [chatMessages, lastReadTimestamps, user.id]
  );

  const unreadChatCount = useMemo(() => {
    const sharedIds = wishlists.filter((w) => w.isShared).map((w) => w.id);
    let total = 0;
    sharedIds.forEach((id) => {
      total += getUnreadCountForWishlist(id);
    });
    return total;
  }, [wishlists, getUnreadCountForWishlist]);

  return useMemo(
    () => ({
      wishlists,
      myLists,
      sharedLists,
      notifications,
      unreadCount,
      user,
      allProducts: wishlists.flatMap((w) => w.items),

      chatMessages,
      assignments,
      unreadChatCount,
      markChatAsRead,
      getUnreadCountForWishlist,
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
      chatMessages, assignments, unreadChatCount, markChatAsRead, getUnreadCountForWishlist,
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
