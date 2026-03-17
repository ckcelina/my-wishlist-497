import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Product, Wishlist, Notification, UserProfile } from "@/types";
import {
  mockWishlists,
  mockNotifications,
  mockUser,
  mockProducts,
  trendingProducts,
} from "@/mocks/data";

const WISHLISTS_KEY = "wishlists_data";
const NOTIFICATIONS_KEY = "notifications_data";

export const [WishlistProvider, useWishlistContext] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  useEffect(() => {
    if (wishlistsQuery.data) {
      setWishlists(wishlistsQuery.data);
    }
  }, [wishlistsQuery.data]);

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data);
    }
  }, [notificationsQuery.data]);

  const syncWishlists = useMutation({
    mutationFn: async (updated: Wishlist[]) => {
      await AsyncStorage.setItem(WISHLISTS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlists"] });
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
      isLoading: wishlistsQuery.isLoading,
      addWishlist,
      addProductToWishlist,
      removeProductFromWishlist,
      togglePurchased,
      markNotificationRead,
    }),
    [
      wishlists,
      myLists,
      sharedLists,
      notifications,
      unreadCount,
      user,
      wishlistsQuery.isLoading,
      addWishlist,
      addProductToWishlist,
      removeProductFromWishlist,
      togglePurchased,
      markNotificationRead,
    ]
  );
});

export function useWishlistById(id: string) {
  const { wishlists } = useWishlistContext();
  return useMemo(() => wishlists.find((w) => w.id === id), [wishlists, id]);
}
