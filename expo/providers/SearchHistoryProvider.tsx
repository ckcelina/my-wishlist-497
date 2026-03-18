import { useState, useCallback, useMemo, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

const SEARCH_HISTORY_KEY = "search_history_v1";
const MAX_HISTORY = 20;

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  country: string;
  resultCount?: number;
}

export const [SearchHistoryProvider, useSearchHistory] = createContextHook(() => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SearchHistoryItem[];
          setHistory(parsed);
          console.log(`[SearchHistory] Loaded ${parsed.length} items`);
        }
      } catch (err) {
        console.log("[SearchHistory] Load error:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
  }, []);

  const addSearch = useCallback(
    async (query: string, country: string, resultCount?: number) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setHistory((prev) => {
        const filtered = prev.filter(
          (item) => item.query.toLowerCase() !== trimmed.toLowerCase()
        );
        const newItem: SearchHistoryItem = {
          query: trimmed,
          timestamp: new Date().toISOString(),
          country,
          resultCount,
        };
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
        void AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
        console.log(`[SearchHistory] Added: "${trimmed}"`);
        return updated;
      });
    },
    []
  );

  const removeSearch = useCallback(async (query: string) => {
    setHistory((prev) => {
      const updated = prev.filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase()
      );
      void AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    console.log("[SearchHistory] Cleared");
  }, []);

  const getRecentSearches = useCallback(
    (limit: number = 5): SearchHistoryItem[] => {
      return history.slice(0, limit);
    },
    [history]
  );

  const getSuggestions = useCallback(
    (prefix: string, limit: number = 5): SearchHistoryItem[] => {
      if (!prefix.trim()) return [];
      const lower = prefix.toLowerCase();
      return history
        .filter((item) => item.query.toLowerCase().startsWith(lower))
        .slice(0, limit);
    },
    [history]
  );

  return useMemo(
    () => ({
      history,
      isLoaded,
      addSearch,
      removeSearch,
      clearHistory,
      getRecentSearches,
      getSuggestions,
    }),
    [history, isLoaded, addSearch, removeSearch, clearHistory, getRecentSearches, getSuggestions]
  );
});
