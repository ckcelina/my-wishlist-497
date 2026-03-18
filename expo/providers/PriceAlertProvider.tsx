import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { AppState, AppStateStatus } from "react-native";
import createContextHook from "@nkzw/create-context-hook";
import { checkPrices, PriceCheckItem, recordPriceHistory, savePriceAlertsToBackend } from "@/lib/api";

const PRICE_ALERTS_KEY = "price_alerts_v2";
const PRICE_HISTORY_KEY = "price_history_v2";
const PRICE_DROPS_KEY = "price_drops_v2";
const LAST_CHECK_KEY = "price_last_check_v2";
const AUTO_CHECK_INTERVAL_MS = 30 * 60 * 1000;

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
  lastCheckedPrice?: number;
  lastCheckedAt?: string;
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
  const autoCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [storedAlerts, storedHistory, storedDrops, storedLastCheck] = await Promise.all([
          AsyncStorage.getItem(PRICE_ALERTS_KEY),
          AsyncStorage.getItem(PRICE_HISTORY_KEY),
          AsyncStorage.getItem(PRICE_DROPS_KEY),
          AsyncStorage.getItem(LAST_CHECK_KEY),
        ]);

        if (storedAlerts) {
          setAlerts(JSON.parse(storedAlerts) as PriceAlert[]);
        }
        if (storedHistory) {
          setPriceHistory(JSON.parse(storedHistory) as Record<string, PriceHistoryEntry[]>);
        }
        if (storedDrops) {
          setPriceDrops(JSON.parse(storedDrops) as PriceDropNotification[]);
        }
        if (storedLastCheck) {
          setLastCheckTime(storedLastCheck);
        }
        console.log("[PriceAlerts] Loaded alerts, history, and drops from storage");
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

  const saveDrops = useCallback(async (updated: PriceDropNotification[]) => {
    await AsyncStorage.setItem(PRICE_DROPS_KEY, JSON.stringify(updated));
  }, []);

  const syncToBackend = useCallback(
    async (
      updatedAlerts?: PriceAlert[],
      updatedHistory?: Record<string, PriceHistoryEntry[]>,
      updatedDrops?: PriceDropNotification[]
    ) => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) return;
        void savePriceAlertsToBackend(
          userId,
          updatedAlerts ?? alerts,
          updatedHistory ?? priceHistory,
          updatedDrops ?? priceDrops
        );
      } catch {
        console.log("[PriceAlerts] Backend sync skipped");
      }
    },
    [alerts, priceHistory, priceDrops]
  );

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

      const initialEntry: PriceHistoryEntry = {
        productId: alert.productId,
        price: alert.currentPrice,
        currency: alert.currency,
        store: alert.store,
        checkedAt: new Date().toISOString(),
      };
      setPriceHistory((prev) => {
        const existing = prev[alert.productId] ?? [];
        const updatedH = { ...prev, [alert.productId]: [...existing, initialEntry].slice(-30) };
        void saveHistory(updatedH);
        void syncToBackend(updated, updatedH, undefined);
        return updatedH;
      });

      console.log(`[PriceAlerts] Added alert for: "${alert.title}"`);
    },
    [alerts, saveAlerts, saveHistory, syncToBackend]
  );

  const removeAlert = useCallback(
    async (productId: string) => {
      const updated = alerts.filter((a) => a.productId !== productId);
      setAlerts(updated);
      await saveAlerts(updated);
      void syncToBackend(updated, undefined, undefined);
      console.log(`[PriceAlerts] Removed alert for: ${productId}`);
    },
    [alerts, saveAlerts, syncToBackend]
  );

  const toggleAlert = useCallback(
    async (productId: string) => {
      const updated = alerts.map((a) =>
        a.productId === productId ? { ...a, isActive: !a.isActive } : a
      );
      setAlerts(updated);
      await saveAlerts(updated);
      void syncToBackend(updated, undefined, undefined);
    },
    [alerts, saveAlerts, syncToBackend]
  );

  const updateAlertPrice = useCallback(
    async (productId: string, newPrice: number, store?: string) => {
      const now = new Date().toISOString();
      const updated = alerts.map((a) =>
        a.productId === productId
          ? { ...a, lastCheckedPrice: newPrice, lastCheckedAt: now, currentPrice: newPrice, store: store ?? a.store }
          : a
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

  const getAlert = useCallback(
    (productId: string): PriceAlert | undefined => {
      return alerts.find((a) => a.productId === productId);
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
        const lastEntry = existing[existing.length - 1];
        if (lastEntry) {
          const timeDiff = Date.now() - new Date(lastEntry.checkedAt).getTime();
          if (timeDiff < 5 * 60 * 1000 && Math.abs(lastEntry.price - entry.price) < 0.01) {
            return prev;
          }
        }
        const updated = { ...prev, [productId]: [...existing, entry].slice(-30) };
        void saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  const recordProductView = useCallback(
    async (productId: string, title: string, price: number, currency: string, store: string, country: string) => {
      console.log(`[PriceAlerts] Recording view for: "${title}" at ${price} ${currency}`);

      await addPriceHistoryEntry(productId, {
        productId,
        price,
        currency,
        store,
        checkedAt: new Date().toISOString(),
      });

      const existingAlert = alerts.find((a) => a.productId === productId && a.isActive);
      if (existingAlert) {
        try {
          const result = await recordPriceHistory(productId, title, price, currency, store, country);
          if (result.entry) {
            await addPriceHistoryEntry(productId, result.entry);
          }
          if (result.dropped && result.livePrice !== null) {
            await updateAlertPrice(productId, result.livePrice, result.entry.store);

            const existingDrop = priceDrops.find(
              (d) => d.productId === productId && Date.now() - new Date(d.timestamp).getTime() < 3600000
            );
            if (!existingDrop) {
              const newDrop: PriceDropNotification = {
                id: `drop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                productId,
                title,
                image: existingAlert.image,
                previousPrice: price,
                currentPrice: result.livePrice,
                savings: result.savings,
                currency,
                store: result.entry.store,
                link: existingAlert.storeUrl,
                timestamp: new Date().toISOString(),
                isRead: false,
              };
              setPriceDrops((prev) => {
                const updated = [newDrop, ...prev].slice(0, 50);
                void saveDrops(updated);
                return updated;
              });
              console.log(`[PriceAlerts] Price drop detected for "${title}"!`);
            }
          }
        } catch (err) {
          console.log("[PriceAlerts] Live price check error:", err);
        }
      }
    },
    [alerts, priceDrops, addPriceHistoryEntry, updateAlertPrice, saveDrops]
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
      const updatedAlerts = [...alerts];

      for (const result of data.results) {
        const alert = alerts.find(
          (a) => a.title.toLowerCase() === result.title.toLowerCase()
        );
        if (!alert) continue;

        if (result.currentPrice > 0) {
          const alertIdx = updatedAlerts.findIndex((a) => a.productId === alert.productId);
          if (alertIdx >= 0) {
            updatedAlerts[alertIdx] = {
              ...updatedAlerts[alertIdx],
              lastCheckedPrice: result.currentPrice,
              lastCheckedAt: now,
            };
          }

          await addPriceHistoryEntry(alert.productId, {
            productId: alert.productId,
            price: result.currentPrice,
            currency: alert.currency,
            store: result.store ?? alert.store,
            checkedAt: now,
          });
        }

        if (result.dropped && result.currentPrice > 0) {
          const existingDrop = priceDrops.find(
            (d) => d.productId === alert.productId && Date.now() - new Date(d.timestamp).getTime() < 3600000
          );
          if (!existingDrop) {
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
          }
        }
      }

      setAlerts(updatedAlerts);
      await saveAlerts(updatedAlerts);

      if (newDrops.length > 0) {
        setPriceDrops((prev) => {
          const updated = [...newDrops, ...prev].slice(0, 50);
          void saveDrops(updated);
          void syncToBackend(updatedAlerts, undefined, updated);
          return updated;
        });
        console.log(`[PriceAlerts] Found ${newDrops.length} price drops!`);
      } else {
        void syncToBackend(updatedAlerts, undefined, undefined);
      }
    },
  });

  const markDropAsRead = useCallback((dropId: string) => {
    setPriceDrops((prev) => {
      const updated = prev.map((d) => (d.id === dropId ? { ...d, isRead: true } : d));
      void saveDrops(updated);
      return updated;
    });
  }, [saveDrops]);

  const markAllDropsAsRead = useCallback(() => {
    setPriceDrops((prev) => {
      const updated = prev.map((d) => ({ ...d, isRead: true }));
      void saveDrops(updated);
      return updated;
    });
  }, [saveDrops]);

  const clearAllDrops = useCallback(() => {
    setPriceDrops([]);
    void saveDrops([]);
  }, [saveDrops]);

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

  useEffect(() => {
    if (!isLoaded) return;

    const activeAlerts = alerts.filter((a) => a.isActive);
    if (activeAlerts.length === 0) return;

    const shouldAutoCheck = () => {
      if (!lastCheckTime) return true;
      const timeSinceLastCheck = Date.now() - new Date(lastCheckTime).getTime();
      return timeSinceLastCheck >= AUTO_CHECK_INTERVAL_MS;
    };

    if (shouldAutoCheck() && !priceCheckMutation.isPending) {
      console.log("[PriceAlerts] Auto-checking prices on load...");
      priceCheckMutation.mutate();
    }

    if (autoCheckTimer.current) {
      clearInterval(autoCheckTimer.current);
    }
    autoCheckTimer.current = setInterval(() => {
      if (!priceCheckMutation.isPending && alerts.filter((a) => a.isActive).length > 0) {
        console.log("[PriceAlerts] Periodic price check...");
        priceCheckMutation.mutate();
      }
    }, AUTO_CHECK_INTERVAL_MS);

    return () => {
      if (autoCheckTimer.current) {
        clearInterval(autoCheckTimer.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, alerts.length]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && isLoaded) {
        const activeAlerts = alerts.filter((a) => a.isActive);
        if (activeAlerts.length === 0) return;

        if (!lastCheckTime) {
          priceCheckMutation.mutate();
          return;
        }

        const timeSinceLastCheck = Date.now() - new Date(lastCheckTime).getTime();
        if (timeSinceLastCheck >= AUTO_CHECK_INTERVAL_MS && !priceCheckMutation.isPending) {
          console.log("[PriceAlerts] App foregrounded, auto-checking prices...");
          priceCheckMutation.mutate();
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, lastCheckTime, alerts.length]);

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
      getAlert,
      getProductHistory,
      addPriceHistoryEntry,
      recordProductView,
      checkPricesNow,
      isCheckingPrices,
      markDropAsRead,
      markAllDropsAsRead,
      clearAllDrops,
      updateAlertPrice,
    }),
    [
      alerts, priceDrops, isLoaded, lastCheckTime, unreadDropCount, activeAlertCount,
      addAlert, removeAlert, toggleAlert, hasAlert, getAlert, getProductHistory,
      addPriceHistoryEntry, recordProductView, checkPricesNow, isCheckingPrices,
      markDropAsRead, markAllDropsAsRead, clearAllDrops, updateAlertPrice,
    ]
  );
});
