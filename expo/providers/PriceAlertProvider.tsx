import { useState, useCallback, useMemo, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { checkPrices, PriceCheckItem } from "@/lib/api";

const PRICE_ALERTS_KEY = "price_alerts_v1";
const PRICE_HISTORY_KEY = "price_history_v1";
const LAST_CHECK_KEY = "price_last_check_v1";

export interface PriceAlert {
  productId: string;
  title: string;
  image: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
  store: string;
  storeUrl: string;
  country: string;
  createdAt: string;
  isActive: boolean;
}

export interface PriceHistoryEntry {
  productId: string;
  price: number;
  currency: string;
  store: string;
  checkedAt: string;
}

export interface PriceDropNotification {
  id: string;
  productId: string;
  title: string;
  image: string;
  previousPrice: number;
  currentPrice: number;
  savings: number;
  currency: string;
  store: string;
  link: string;
  timestamp: string;
  isRead: boolean;
}

export const [PriceAlertProvider, usePriceAlerts] = createContextHook(() => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, PriceHistoryEntry[]>>({});
  const [priceDrops, setPriceDrops] = useState<PriceDropNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [storedAlerts, storedHistory, storedLastCheck] = await Promise.all([
          AsyncStorage.getItem(PRICE_ALERTS_KEY),
          AsyncStorage.getItem(PRICE_HISTORY_KEY),
          AsyncStorage.getItem(LAST_CHECK_KEY),
        ]);

        if (storedAlerts) {
          setAlerts(JSON.parse(storedAlerts) as PriceAlert[]);
        }
        if (storedHistory) {
          setPriceHistory(JSON.parse(storedHistory) as Record<string, PriceHistoryEntry[]>);
        }
        if (storedLastCheck) {
          setLastCheckTime(storedLastCheck);
        }
        console.log("[PriceAlerts] Loaded alerts and history");
      } catch (err) {
        console.log("[PriceAlerts] Load error:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
  }, []);

  const saveAlerts = useCallback(async (updated: PriceAlert[]) => {
    await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(updated));
  }, []);

  const saveHistory = useCallback(async (updated: Record<string, PriceHistoryEntry[]>) => {
    await AsyncStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(updated));
  }, []);

  const addAlert = useCallback(
    async (alert: Omit<PriceAlert, "createdAt" | "isActive">) => {
      const existing = alerts.find((a) => a.productId === alert.productId);
      if (existing) {
        console.log("[PriceAlerts] Alert already exists for:", alert.title);
        return;
      }

      const newAlert: PriceAlert = {
        ...alert,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      const updated = [...alerts, newAlert];
      setAlerts(updated);
      await saveAlerts(updated);
      console.log(`[PriceAlerts] Added alert for: "${alert.title}"`);
    },
    [alerts, saveAlerts]
  );

  const removeAlert = useCallback(
    async (productId: string) => {
      const updated = alerts.filter((a) => a.productId !== productId);
      setAlerts(updated);
      await saveAlerts(updated);
      console.log(`[PriceAlerts] Removed alert for: ${productId}`);
    },
    [alerts, saveAlerts]
  );

  const toggleAlert = useCallback(
    async (productId: string) => {
      const updated = alerts.map((a) =>
        a.productId === productId ? { ...a, isActive: !a.isActive } : a
      );
      setAlerts(updated);
      await saveAlerts(updated);
    },
    [alerts, saveAlerts]
  );

  const hasAlert = useCallback(
    (productId: string): boolean => {
      return alerts.some((a) => a.productId === productId && a.isActive);
    },
    [alerts]
  );

  const getProductHistory = useCallback(
    (productId: string): PriceHistoryEntry[] => {
      return priceHistory[productId] ?? [];
    },
    [priceHistory]
  );

  const addPriceHistoryEntry = useCallback(
    async (productId: string, entry: PriceHistoryEntry) => {
      setPriceHistory((prev) => {
        const existing = prev[productId] ?? [];
        const updated = { ...prev, [productId]: [...existing, entry].slice(-30) };
        void saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  const priceCheckMutation = useMutation({
    mutationFn: async () => {
      const activeAlerts = alerts.filter((a) => a.isActive);
      if (activeAlerts.length === 0) {
        return { results: [] as PriceCheckItem[], error: null };
      }

      console.log(`[PriceAlerts] Checking prices for ${activeAlerts.length} alerts`);
      const products = activeAlerts.map((a) => ({
        title: a.title,
        lastPrice: a.currentPrice,
        currency: a.currency,
        country: a.country,
      }));

      return checkPrices(products);
    },
    onSuccess: async (data) => {
      if (!data.results || data.results.length === 0) return;

      const now = new Date().toISOString();
      setLastCheckTime(now);
      await AsyncStorage.setItem(LAST_CHECK_KEY, now);

      const newDrops: PriceDropNotification[] = [];

      for (const result of data.results) {
        if (result.dropped && result.currentPrice > 0) {
          const alert = alerts.find(
            (a) => a.title.toLowerCase() === result.title.toLowerCase()
          );
          if (alert) {
            newDrops.push({
              id: `drop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              productId: alert.productId,
              title: alert.title,
              image: alert.image,
              previousPrice: result.previousPrice,
              currentPrice: result.currentPrice,
              savings: result.savings ?? 0,
              currency: alert.currency,
              store: result.store ?? alert.store,
              link: result.link ?? alert.storeUrl,
              timestamp: now,
              isRead: false,
            });

            await addPriceHistoryEntry(alert.productId, {
              productId: alert.productId,
              price: result.currentPrice,
              currency: alert.currency,
              store: result.store ?? alert.store,
              checkedAt: now,
            });
          }
        }
      }

      if (newDrops.length > 0) {
        setPriceDrops((prev) => [...newDrops, ...prev].slice(0, 50));
        console.log(`[PriceAlerts] Found ${newDrops.length} price drops!`);
      }
    },
  });

  const markDropAsRead = useCallback((dropId: string) => {
    setPriceDrops((prev) =>
      prev.map((d) => (d.id === dropId ? { ...d, isRead: true } : d))
    );
  }, []);

  const unreadDropCount = useMemo(
    () => priceDrops.filter((d) => !d.isRead).length,
    [priceDrops]
  );

  const activeAlertCount = useMemo(
    () => alerts.filter((a) => a.isActive).length,
    [alerts]
  );

  const checkPricesNow = useCallback(() => {
    priceCheckMutation.mutate();
  }, [priceCheckMutation]);

  const isCheckingPrices = priceCheckMutation.isPending;

  return useMemo(
    () => ({
      alerts,
      priceDrops,
      isLoaded,
      lastCheckTime,
      unreadDropCount,
      activeAlertCount,
      addAlert,
      removeAlert,
      toggleAlert,
      hasAlert,
      getProductHistory,
      addPriceHistoryEntry,
      checkPricesNow,
      isCheckingPrices,
      markDropAsRead,
    }),
    [
      alerts, priceDrops, isLoaded, lastCheckTime, unreadDropCount, activeAlertCount,
      addAlert, removeAlert, toggleAlert, hasAlert, getProductHistory,
      addPriceHistoryEntry, checkPricesNow, isCheckingPrices, markDropAsRead,
    ]
  );
});
