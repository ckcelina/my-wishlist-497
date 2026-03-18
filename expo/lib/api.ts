const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    console.warn("EXPO_PUBLIC_RORK_API_BASE_URL is not set");
    return "";
  }
  return url;
};

export interface SerpApiResult {
  title: string;
  price: number;
  currency: string;
  store: string;
  link: string;
  image: string;
  rating?: number;
  reviews?: number;
  snippet: string;
  productId?: string;
  delivery?: string;
}

export interface ScrapeResult {
  title: string;
  image: string;
  description: string;
  price: number;
  currency: string;
  store: string;
  url: string;
  error: string | null;
}

export interface ProductDetailResult {
  title: string;
  description: string;
  prices: unknown;
  rating?: number;
  reviews?: number;
  images: string[];
  highlights: string[];
  sellers: ProductSeller[];
  error: string | null;
}

export interface ProductSeller {
  name: string;
  link: string;
  basePrice: string;
  totalPrice: string;
  price: number;
  delivery: string;
}

export interface PriceComparisonResult {
  comparison: {
    country: string;
    results: {
      title: string;
      price: number;
      currency: string;
      store: string;
      link: string;
      image: string;
    }[];
  }[];
  error: string | null;
}

export interface TrendingResult {
  results: SerpApiResult[];
  category: string;
  error: string | null;
}

export interface DealsResult {
  results: SerpApiResult[];
  error: string | null;
}

export interface PriceCheckItem {
  title: string;
  currentPrice: number;
  previousPrice: number;
  dropped: boolean;
  savings?: number;
  store?: string;
  link?: string;
}

export interface PriceCheckResult {
  results: PriceCheckItem[];
  error: string | null;
}

export interface DbHealthResult {
  status: string;
  message: string;
  tables: Record<string, { exists: boolean; count: number; error?: string }>;
}

export async function scrapeProductUrl(url: string): Promise<ScrapeResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { title: "", image: "", description: "", price: 0, currency: "USD", store: "", url, error: "API URL not configured" };
    }

    console.log(`[API] Scraping URL: ${url}`);
    const response = await fetch(`${baseUrl}/api/scrape/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        title: "", image: "", description: "", price: 0, currency: "USD", store: "", url,
        error: (errorData as Record<string, string>).error || `Request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log("[API] Scrape result:", JSON.stringify(data).substring(0, 200));
    return data as ScrapeResult;
  } catch (err) {
    console.error("[API] Scrape failed:", err);
    return { title: "", image: "", description: "", price: 0, currency: "USD", store: "", url, error: "Network error" };
  }
}

export async function searchProducts(
  query: string,
  country: string = "us",
  options?: { minPrice?: number; maxPrice?: number; sortBy?: string }
): Promise<{ results: SerpApiResult[]; error: string | null }> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { results: [], error: "API URL not configured" };
    }

    console.log(`[API] Searching products: "${query}" in ${country}`);
    const response = await fetch(`${baseUrl}/api/search/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        country,
        minPrice: options?.minPrice,
        maxPrice: options?.maxPrice,
        sortBy: options?.sortBy,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("[API] Search error response:", JSON.stringify(errorData));
      return {
        results: [],
        error: (errorData as Record<string, string>).error || `Request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    const result = data as { results: SerpApiResult[]; error: string | null };
    console.log(`[API] Search returned ${result.results.length} results`);
    return result;
  } catch (err) {
    console.error("[API] Search failed:", err);
    return { results: [], error: "Network error" };
  }
}

export async function getProductDetail(
  productId: string,
  country: string = "us"
): Promise<ProductDetailResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { title: "", description: "", prices: null, images: [], highlights: [], sellers: [], error: "API URL not configured" };
    }

    console.log(`[API] Getting product detail: ${productId}`);
    const response = await fetch(`${baseUrl}/api/search/product-detail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, country }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        title: "", description: "", prices: null, images: [], highlights: [], sellers: [],
        error: (errorData as Record<string, string>).error || `Request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log("[API] Product detail result:", JSON.stringify(data).substring(0, 200));
    return data as ProductDetailResult;
  } catch (err) {
    console.error("[API] Product detail failed:", err);
    return { title: "", description: "", prices: null, images: [], highlights: [], sellers: [], error: "Network error" };
  }
}

export async function comparePrices(
  query: string,
  countries: string[] = ["us", "uk", "ca", "au"]
): Promise<PriceComparisonResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { comparison: [], error: "API URL not configured" };
    }

    console.log(`[API] Comparing prices for: "${query}" across ${countries.join(", ")}`);
    const response = await fetch(`${baseUrl}/api/search/compare-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, countries }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        comparison: [],
        error: (errorData as Record<string, string>).error || `Request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log("[API] Price comparison result received");
    return data as PriceComparisonResult;
  } catch (err) {
    console.error("[API] Price comparison failed:", err);
    return { comparison: [], error: "Network error" };
  }
}

export async function fetchTrendingProducts(
  country: string = "us",
  categories?: string[]
): Promise<TrendingResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { results: [], category: "", error: "API URL not configured" };
    }

    console.log(`[API] Fetching trending in ${country}`);
    const response = await fetch(`${baseUrl}/api/search/trending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, categories }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        results: [],
        category: "",
        error: (errorData as Record<string, string>).error || `Request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`[API] Trending returned ${(data as TrendingResult).results.length} results`);
    return data as TrendingResult;
  } catch (err) {
    console.error("[API] Trending failed:", err);
    return { results: [], category: "", error: "Network error" };
  }
}

export async function fetchDeals(
  country: string = "us",
  category: string = "deals"
): Promise<DealsResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { results: [], error: "API URL not configured" };
    }

    console.log(`[API] Fetching deals: ${category} in ${country}`);
    const response = await fetch(`${baseUrl}/api/search/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, category }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        results: [],
        error: (errorData as Record<string, string>).error || `Request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`[API] Deals returned ${(data as DealsResult).results.length} results`);
    return data as DealsResult;
  } catch (err) {
    console.error("[API] Deals failed:", err);
    return { results: [], error: "Network error" };
  }
}

export async function checkPrices(
  products: { title: string; lastPrice: number; currency: string; country: string }[]
): Promise<PriceCheckResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { results: [], error: "API URL not configured" };
    }

    console.log(`[API] Checking prices for ${products.length} products`);
    const response = await fetch(`${baseUrl}/api/search/price-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        results: [],
        error: (errorData as Record<string, string>).error || `Request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`[API] Price check complete`);
    return data as PriceCheckResult;
  } catch (err) {
    console.error("[API] Price check failed:", err);
    return { results: [], error: "Network error" };
  }
}

export interface PriceHistoryRecordResult {
  entry: {
    productId: string;
    price: number;
    currency: string;
    store: string;
    checkedAt: string;
  };
  livePrice: number | null;
  dropped: boolean;
  savings: number;
}

export async function recordPriceHistory(
  productId: string,
  title: string,
  price: number,
  currency: string,
  store: string,
  country: string
): Promise<PriceHistoryRecordResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        entry: { productId, price, currency, store, checkedAt: new Date().toISOString() },
        livePrice: null,
        dropped: false,
        savings: 0,
      };
    }

    console.log(`[API] Recording price history for: "${title}"`);
    const response = await fetch(`${baseUrl}/api/price-history/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, title, price, currency, store, country }),
    });

    if (!response.ok) {
      console.log(`[API] Price history record failed: ${response.status}`);
      return {
        entry: { productId, price, currency, store, checkedAt: new Date().toISOString() },
        livePrice: null,
        dropped: false,
        savings: 0,
      };
    }

    const data = await response.json();
    console.log(`[API] Price history recorded, dropped: ${(data as PriceHistoryRecordResult).dropped}`);
    return data as PriceHistoryRecordResult;
  } catch (err) {
    console.error("[API] Price history record failed:", err);
    return {
      entry: { productId, price, currency, store, checkedAt: new Date().toISOString() },
      livePrice: null,
      dropped: false,
      savings: 0,
    };
  }
}

export async function savePriceAlertsToBackend(
  userId: string,
  alerts: unknown[],
  priceHistory: Record<string, unknown[]>,
  priceDrops: unknown[]
): Promise<{ success: boolean }> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return { success: false };

    console.log(`[API] Saving price alerts for user: ${userId}`);
    const response = await fetch(`${baseUrl}/api/price-alerts/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, alerts, priceHistory, priceDrops }),
    });

    if (!response.ok) return { success: false };
    return { success: true };
  } catch (err) {
    console.error("[API] Save alerts failed:", err);
    return { success: false };
  }
}

export async function loadPriceAlertsFromBackend(
  userId: string
): Promise<{ alerts: unknown[]; priceHistory: Record<string, unknown[]>; priceDrops: unknown[] }> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return { alerts: [], priceHistory: {}, priceDrops: [] };

    console.log(`[API] Loading price alerts for user: ${userId}`);
    const response = await fetch(`${baseUrl}/api/price-alerts/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) return { alerts: [], priceHistory: {}, priceDrops: [] };

    const data = await response.json();
    return data as { alerts: unknown[]; priceHistory: Record<string, unknown[]>; priceDrops: unknown[] };
  } catch (err) {
    console.error("[API] Load alerts failed:", err);
    return { alerts: [], priceHistory: {}, priceDrops: [] };
  }
}

export async function checkDatabaseHealth(): Promise<DbHealthResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { status: "error", message: "API URL not configured", tables: {} };
    }

    console.log("[API] Checking database health...");
    const response = await fetch(`${baseUrl}/api/db/health`);

    if (!response.ok) {
      return { status: "error", message: `Health check failed: ${response.status}`, tables: {} };
    }

    const data = await response.json();
    const result = data as DbHealthResult;
    console.log(`[API] DB Health: ${result.status} - ${result.message}`);
    return result;
  } catch (err) {
    console.error("[API] Health check failed:", err);
    return { status: "error", message: "Network error", tables: {} };
  }
}
