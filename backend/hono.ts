import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ status: "ok", message: "My Wishlist API is running" });
});

app.post("/scrape/url", async (c) => {
  try {
    const body = await c.req.json();
    const { url } = body as { url: string };

    if (!url) {
      return c.json({ error: "URL is required" }, 400);
    }

    console.log("[Scrape] Fetching URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      return c.json(
        { error: `Failed to fetch URL: ${response.status}` },
        502
      );
    }

    const html = await response.text();
    const truncated = html.substring(0, 20000);

    const titleMatch = truncated.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch =
      truncated.match(/property="og:title"\s+content="([^"]+)"/i) ||
      truncated.match(/content="([^"]+)"\s+property="og:title"/i) ||
      truncated.match(/name="og:title"\s+content="([^"]+)"/i);
    const ogImageMatch =
      truncated.match(/property="og:image"\s+content="([^"]+)"/i) ||
      truncated.match(/content="([^"]+)"\s+property="og:image"/i) ||
      truncated.match(/name="og:image"\s+content="([^"]+)"/i);
    const ogDescMatch =
      truncated.match(/property="og:description"\s+content="([^"]+)"/i) ||
      truncated.match(/content="([^"]+)"\s+property="og:description"/i) ||
      truncated.match(/name="description"\s+content="([^"]+)"/i);
    const priceMatch =
      truncated.match(/"price"\s*:\s*"?([\d.]+)"?/i) ||
      truncated.match(/"amount"\s*:\s*"?([\d.]+)"?/i) ||
      truncated.match(/class="[^"]*price[^"]*"[^>]*>\s*\$?([\d,.]+)/i) ||
      truncated.match(/\$([\d,.]+)/);
    const currencyMatch =
      truncated.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/i) ||
      truncated.match(/"currency"\s*:\s*"([A-Z]{3})"/i);

    const productTitle = ogTitleMatch?.[1] || titleMatch?.[1] || "";
    const productImage = ogImageMatch?.[1] || "";
    const productDesc = ogDescMatch?.[1] || "";
    const productPrice = priceMatch?.[1]
      ? parseFloat(priceMatch[1].replace(",", ""))
      : 0;
    const productCurrency = currencyMatch?.[1] || "USD";

    let storeName = "";
    try {
      const urlObj = new URL(url);
      storeName = urlObj.hostname.replace("www.", "").split(".")[0];
      storeName = storeName.charAt(0).toUpperCase() + storeName.slice(1);
    } catch {
      storeName = "Unknown Store";
    }

    console.log("[Scrape] Extracted:", {
      productTitle,
      storeName,
      productPrice,
      productCurrency,
    });

    return c.json({
      title: productTitle,
      image: productImage,
      description: productDesc,
      price: productPrice,
      currency: productCurrency,
      store: storeName,
      url,
      error: null,
    });
  } catch (err) {
    console.error("[Scrape] Failed:", err);
    return c.json({ error: "Failed to scrape URL" }, 500);
  }
});

app.post("/search/products", async (c) => {
  try {
    const body = await c.req.json();
    const {
      query,
      country = "us",
      minPrice,
      maxPrice,
      sortBy,
    } = body as {
      query: string;
      country?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
    };

    if (!query) {
      return c.json({ results: [], error: "Query is required" }, 400);
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      console.log("[SerpAPI] No API key configured, key name: SERPAPI_KEY");
      return c.json(
        { results: [], error: "SerpAPI key not configured" },
        500
      );
    }

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      api_key: apiKey,
      gl: country,
      hl: "en",
      num: "20",
    });

    if (minPrice !== undefined) {
      params.set("min_price", String(minPrice));
    }
    if (maxPrice !== undefined) {
      params.set("max_price", String(maxPrice));
    }
    if (sortBy) {
      params.set("sort_by", sortBy);
    }

    const serpUrl = `https://serpapi.com/search.json?${params.toString()}`;
    console.log(`[SerpAPI] Searching: "${query}" in ${country}`);
    console.log(`[SerpAPI] URL: ${serpUrl.replace(apiKey, "***")}`);

    const response = await fetch(serpUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        `[SerpAPI] Error ${response.status}: ${errorText.substring(0, 200)}`
      );
      return c.json(
        { results: [], error: `SerpAPI returned ${response.status}` },
        502
      );
    }

    const data = (await response.json()) as Record<string, unknown>;

    if (data.error) {
      console.log(`[SerpAPI] API Error: ${data.error}`);
      return c.json(
        { results: [], error: `SerpAPI error: ${data.error}` },
        502
      );
    }

    const shoppingResults =
      (data.shopping_results as Record<string, unknown>[]) || [];

    const results = shoppingResults.slice(0, 20).map(
      (item: Record<string, unknown>) => ({
        title: (item.title as string) || "",
        price:
          typeof item.extracted_price === "number" ? item.extracted_price : 0,
        currency: (item.currency as string) || "USD",
        store: (item.source as string) || "Unknown",
        link: (item.link as string) || (item.product_link as string) || "",
        image: (item.thumbnail as string) || "",
        rating: typeof item.rating === "number" ? item.rating : undefined,
        reviews:
          typeof item.reviews === "number" ? item.reviews : undefined,
        snippet: (item.snippet as string) || "",
        productId: (item.product_id as string) || "",
        delivery: (item.delivery as string) || "",
      })
    );

    console.log(
      `[SerpAPI] Found ${results.length} shopping results for "${query}"`
    );
    return c.json({ results, error: null });
  } catch (err) {
    console.error("[SerpAPI] Search failed:", err);
    return c.json({ results: [], error: "Search failed" }, 500);
  }
});

app.post("/search/product-detail", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, country = "us" } = body as {
      productId: string;
      country?: string;
    };

    if (!productId) {
      return c.json({ error: "productId is required" }, 400);
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return c.json({ error: "SerpAPI key not configured" }, 500);
    }

    const params = new URLSearchParams({
      engine: "google_product",
      product_id: productId,
      api_key: apiKey,
      gl: country,
      hl: "en",
    });

    console.log(`[SerpAPI] Fetching product detail: ${productId}`);
    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        `[SerpAPI] Product detail error ${response.status}: ${errorText.substring(0, 200)}`
      );
      return c.json(
        { error: `SerpAPI returned ${response.status}` },
        502
      );
    }

    const data = (await response.json()) as Record<string, unknown>;

    if (data.error) {
      console.log(`[SerpAPI] Product detail API error: ${data.error}`);
      return c.json({ error: `SerpAPI error: ${data.error}` }, 502);
    }

    const productResults = data.product_results as Record<
      string,
      unknown
    > | null;
    const sellersResults = data.sellers_results as Record<
      string,
      unknown
    > | null;

    const onlineSellers =
      (sellersResults?.online_sellers as Record<string, unknown>[]) || [];

    const sellers = onlineSellers.map(
      (seller: Record<string, unknown>) => ({
        name: (seller.name as string) || "",
        link: (seller.link as string) || "",
        basePrice: (seller.base_price as string) || "",
        totalPrice: (seller.total_price as string) || "",
        price:
          typeof seller.extracted_price === "number"
            ? seller.extracted_price
            : 0,
        delivery: (seller.delivery as string) || "",
      })
    );

    const result = {
      title: (productResults?.title as string) || "",
      description: (productResults?.description as string) || "",
      prices: productResults?.prices as unknown,
      rating:
        typeof productResults?.rating === "number"
          ? productResults.rating
          : undefined,
      reviews:
        typeof productResults?.reviews === "number"
          ? productResults.reviews
          : undefined,
      images: (productResults?.images as string[]) || [],
      highlights: (productResults?.highlights as string[]) || [],
      sellers,
      error: null,
    };

    console.log(
      `[SerpAPI] Product detail found: "${result.title}" with ${sellers.length} sellers`
    );
    return c.json(result);
  } catch (err) {
    console.error("[SerpAPI] Product detail failed:", err);
    return c.json({ error: "Product detail fetch failed" }, 500);
  }
});

app.post("/search/compare-prices", async (c) => {
  try {
    const body = await c.req.json();
    const { query, countries = ["us", "uk", "ca", "au"] } = body as {
      query: string;
      countries?: string[];
    };

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return c.json({ error: "SerpAPI key not configured" }, 500);
    }

    console.log(
      `[SerpAPI] Comparing prices for "${query}" across ${countries.join(", ")}`
    );

    const countryResults = await Promise.allSettled(
      countries.map(async (country) => {
        const params = new URLSearchParams({
          engine: "google_shopping",
          q: query,
          api_key: apiKey,
          gl: country,
          hl: "en",
          num: "5",
        });

        const resp = await fetch(
          `https://serpapi.com/search.json?${params.toString()}`
        );
        if (!resp.ok) return { country, results: [] };

        const data = (await resp.json()) as Record<string, unknown>;
        const shoppingResults =
          (data.shopping_results as Record<string, unknown>[]) || [];

        return {
          country,
          results: shoppingResults.slice(0, 5).map(
            (item: Record<string, unknown>) => ({
              title: (item.title as string) || "",
              price:
                typeof item.extracted_price === "number"
                  ? item.extracted_price
                  : 0,
              currency: (item.currency as string) || "USD",
              store: (item.source as string) || "Unknown",
              link: (item.link as string) || "",
              image: (item.thumbnail as string) || "",
            })
          ),
        };
      })
    );

    const comparison = countryResults
      .filter(
        (r): r is PromiseFulfilledResult<{ country: string; results: unknown[] }> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value);

    console.log(
      `[SerpAPI] Price comparison complete for ${comparison.length} countries`
    );
    return c.json({ comparison, error: null });
  } catch (err) {
    console.error("[SerpAPI] Price comparison failed:", err);
    return c.json({ error: "Price comparison failed" }, 500);
  }
});

app.get("/exchange-rates", async (c) => {
  const rates: Record<string, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53, CAD: 1.36,
    CHF: 0.88, CNY: 7.24, SEK: 10.45, NZD: 1.67, MXN: 17.15, SGD: 1.34,
    HKD: 7.82, NOK: 10.55, KRW: 1320, TRY: 32.5, INR: 83.4, RUB: 92,
    BRL: 4.97, ZAR: 18.6, TWD: 31.5, DKK: 6.88, PLN: 4.02, THB: 35.8,
    IDR: 15700, HUF: 358, CZK: 23.2, ILS: 3.65, CLP: 940, PHP: 56.5,
    AED: 3.67, COP: 3950, SAR: 3.75, MYR: 4.72, RON: 4.58, ARS: 870,
    PKR: 278, EGP: 30.9, NGN: 1550, BDT: 110, VND: 24500, UAH: 38.5,
    KES: 155, QAR: 3.64, KWD: 0.31, BHD: 0.376, OMR: 0.385, JOD: 0.709,
    LBP: 89500, MAD: 10.1, TND: 3.12, GHS: 15.2, TZS: 2510, UGX: 3800,
    ETB: 56.8, RWF: 1270, XOF: 605, XAF: 605, LKR: 320, NPR: 133,
    GEL: 2.68, KZT: 460, ISK: 137,
  };
  return c.json({ rates, base: "USD", updated: new Date().toISOString() });
});

app.post("/convert", async (c) => {
  try {
    const body = await c.req.json();
    const { amount, from, to } = body as { amount: number; from: string; to: string };

    const rates: Record<string, number> = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53, CAD: 1.36,
      CHF: 0.88, CNY: 7.24, AED: 3.67, SAR: 3.75, KWD: 0.31, BHD: 0.376,
      QAR: 3.64, OMR: 0.385, JOD: 0.709, EGP: 30.9, INR: 83.4, PKR: 278,
      BRL: 4.97, MXN: 17.15, KRW: 1320, SGD: 1.34, MYR: 4.72, THB: 35.8,
      IDR: 15700, PHP: 56.5, VND: 24500, NGN: 1550, KES: 155, ZAR: 18.6,
      TRY: 32.5, PLN: 4.02, CZK: 23.2, HUF: 358, RON: 4.58, SEK: 10.45,
      NOK: 10.55, DKK: 6.88, HKD: 7.82, TWD: 31.5, NZD: 1.67, CLP: 940,
      COP: 3950, ARS: 870, PEN: 3.72, ILS: 3.65, MAD: 10.1,
    };

    const fromRate = rates[from] ?? 1;
    const toRate = rates[to] ?? 1;
    const converted = (amount / fromRate) * toRate;

    return c.json({ amount, from, to, converted, rate: toRate / fromRate });
  } catch (err) {
    console.error("[Convert] Error:", err);
    return c.json({ error: "Conversion failed" }, 500);
  }
});

app.post("/search/trending", async (c) => {
  try {
    const body = await c.req.json();
    const { country = "us", categories } = body as {
      country?: string;
      categories?: string[];
    };

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return c.json({ results: [], error: "SerpAPI key not configured" }, 500);
    }

    const defaultCategories = [
      "trending tech gadgets",
      "best sellers electronics",
      "popular fashion items",
      "top rated home decor",
    ];
    const searchCategories = categories ?? defaultCategories;
    const randomCategory =
      searchCategories[Math.floor(Math.random() * searchCategories.length)];

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: randomCategory,
      api_key: apiKey,
      gl: country,
      hl: "en",
      num: "10",
      sort_by: "review_score",
    });

    console.log(
      `[SerpAPI] Fetching trending: "${randomCategory}" in ${country}`
    );
    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    if (!response.ok) {
      return c.json(
        { results: [], error: `SerpAPI returned ${response.status}` },
        502
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    const shoppingResults =
      (data.shopping_results as Record<string, unknown>[]) || [];

    const results = shoppingResults.slice(0, 10).map(
      (item: Record<string, unknown>) => ({
        title: (item.title as string) || "",
        price:
          typeof item.extracted_price === "number" ? item.extracted_price : 0,
        currency: (item.currency as string) || "USD",
        store: (item.source as string) || "Unknown",
        link: (item.link as string) || (item.product_link as string) || "",
        image: (item.thumbnail as string) || "",
        rating: typeof item.rating === "number" ? item.rating : undefined,
        reviews: typeof item.reviews === "number" ? item.reviews : undefined,
        snippet: (item.snippet as string) || "",
        productId: (item.product_id as string) || "",
        delivery: (item.delivery as string) || "",
        category: randomCategory,
      })
    );

    console.log(`[SerpAPI] Trending: ${results.length} results`);
    return c.json({ results, category: randomCategory, error: null });
  } catch (err) {
    console.error("[SerpAPI] Trending failed:", err);
    return c.json({ results: [], error: "Trending fetch failed" }, 500);
  }
});

app.post("/search/deals", async (c) => {
  try {
    const body = await c.req.json();
    const { country = "us", category = "deals" } = body as {
      country?: string;
      category?: string;
    };

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return c.json({ results: [], error: "SerpAPI key not configured" }, 500);
    }

    const dealQueries: Record<string, string> = {
      deals: "best deals today",
      electronics: "electronics deals sale",
      fashion: "fashion clothing sale discount",
      home: "home decor deals clearance",
      beauty: "beauty products on sale",
      tech: "tech gadgets deals discount",
    };

    const query = dealQueries[category] || `${category} deals sale`;

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      api_key: apiKey,
      gl: country,
      hl: "en",
      num: "15",
      sort_by: "price_low_to_high",
    });

    console.log(`[SerpAPI] Fetching deals: "${query}" in ${country}`);
    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    if (!response.ok) {
      return c.json(
        { results: [], error: `SerpAPI returned ${response.status}` },
        502
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    const shoppingResults =
      (data.shopping_results as Record<string, unknown>[]) || [];

    const results = shoppingResults.slice(0, 15).map(
      (item: Record<string, unknown>) => ({
        title: (item.title as string) || "",
        price:
          typeof item.extracted_price === "number" ? item.extracted_price : 0,
        currency: (item.currency as string) || "USD",
        store: (item.source as string) || "Unknown",
        link: (item.link as string) || (item.product_link as string) || "",
        image: (item.thumbnail as string) || "",
        rating: typeof item.rating === "number" ? item.rating : undefined,
        reviews: typeof item.reviews === "number" ? item.reviews : undefined,
        snippet: (item.snippet as string) || "",
        productId: (item.product_id as string) || "",
        delivery: (item.delivery as string) || "",
      })
    );

    console.log(`[SerpAPI] Deals: ${results.length} results`);
    return c.json({ results, error: null });
  } catch (err) {
    console.error("[SerpAPI] Deals failed:", err);
    return c.json({ results: [], error: "Deals fetch failed" }, 500);
  }
});

app.post("/search/price-check", async (c) => {
  try {
    const body = await c.req.json();
    const { products } = body as {
      products: { title: string; lastPrice: number; currency: string; country: string }[];
    };

    if (!products || products.length === 0) {
      return c.json({ results: [], error: "No products provided" }, 400);
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return c.json({ results: [], error: "SerpAPI key not configured" }, 500);
    }

    console.log(
      `[SerpAPI] Price check for ${products.length} products`
    );

    const checkResults = await Promise.allSettled(
      products.slice(0, 5).map(async (product) => {
        const params = new URLSearchParams({
          engine: "google_shopping",
          q: product.title,
          api_key: apiKey,
          gl: product.country || "us",
          hl: "en",
          num: "3",
        });

        const resp = await fetch(
          `https://serpapi.com/search.json?${params.toString()}`
        );
        if (!resp.ok) return { title: product.title, currentPrice: 0, previousPrice: product.lastPrice, dropped: false };

        const data = (await resp.json()) as Record<string, unknown>;
        const results =
          (data.shopping_results as Record<string, unknown>[]) || [];
        const topResult = results[0];
        const currentPrice =
          topResult && typeof topResult.extracted_price === "number"
            ? topResult.extracted_price
            : 0;

        return {
          title: product.title,
          currentPrice,
          previousPrice: product.lastPrice,
          dropped: currentPrice > 0 && currentPrice < product.lastPrice,
          savings: currentPrice > 0 ? product.lastPrice - currentPrice : 0,
          store: topResult ? (topResult.source as string) || "" : "",
          link: topResult ? (topResult.link as string) || "" : "",
        };
      })
    );

    const results = checkResults
      .filter(
        (r): r is PromiseFulfilledResult<{
          title: string;
          currentPrice: number;
          previousPrice: number;
          dropped: boolean;
          savings?: number;
          store?: string;
          link?: string;
        }> => r.status === "fulfilled"
      )
      .map((r) => r.value);

    const droppedCount = results.filter((r) => r.dropped).length;
    console.log(
      `[SerpAPI] Price check complete: ${droppedCount}/${results.length} dropped`
    );

    return c.json({ results, error: null });
  } catch (err) {
    console.error("[SerpAPI] Price check failed:", err);
    return c.json({ results: [], error: "Price check failed" }, 500);
  }
});

app.post("/price-alerts/save", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, alerts, priceHistory, priceDrops } = body as {
      userId: string;
      alerts: unknown[];
      priceHistory: Record<string, unknown[]>;
      priceDrops: unknown[];
    };

    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    console.log(`[PriceAlerts] Saving ${alerts?.length ?? 0} alerts, ${priceDrops?.length ?? 0} drops for user ${userId}`);

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/price_alerts`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            user_id: userId,
            alerts_data: JSON.stringify(alerts ?? []),
            history_data: JSON.stringify(priceHistory ?? {}),
            drops_data: JSON.stringify(priceDrops ?? []),
            updated_at: new Date().toISOString(),
          }),
        });
        console.log(`[PriceAlerts] Saved to Supabase`);
      } catch (dbErr) {
        console.log(`[PriceAlerts] Supabase save failed (non-critical):`, dbErr);
      }
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("[PriceAlerts] Save failed:", err);
    return c.json({ error: "Failed to save alerts" }, 500);
  }
});

app.post("/price-alerts/load", async (c) => {
  try {
    const body = await c.req.json();
    const { userId } = body as { userId: string };

    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return c.json({ alerts: [], priceHistory: {}, priceDrops: [] });
    }

    try {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/price_alerts?user_id=eq.${userId}&select=*&limit=1`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (resp.ok) {
        const rows = (await resp.json()) as Record<string, string>[];
        if (rows.length > 0) {
          const row = rows[0];
          console.log(`[PriceAlerts] Loaded data for user ${userId}`);
          return c.json({
            alerts: JSON.parse(row.alerts_data || "[]"),
            priceHistory: JSON.parse(row.history_data || "{}"),
            priceDrops: JSON.parse(row.drops_data || "[]"),
          });
        }
      }
    } catch (dbErr) {
      console.log(`[PriceAlerts] Supabase load failed:`, dbErr);
    }

    return c.json({ alerts: [], priceHistory: {}, priceDrops: [] });
  } catch (err) {
    console.error("[PriceAlerts] Load failed:", err);
    return c.json({ error: "Failed to load alerts" }, 500);
  }
});

app.post("/price-history/record", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, title, price, currency, store, country } = body as {
      productId: string;
      title: string;
      price: number;
      currency: string;
      store: string;
      country: string;
    };

    if (!productId || !title) {
      return c.json({ error: "productId and title are required" }, 400);
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return c.json({
        entry: {
          productId,
          price,
          currency,
          store,
          checkedAt: new Date().toISOString(),
        },
        livePrice: null,
      });
    }

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: title,
      api_key: apiKey,
      gl: country || "us",
      hl: "en",
      num: "3",
    });

    console.log(`[PriceHistory] Checking live price for: "${title}"`);
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    let livePrice = price;
    let liveStore = store;
    let liveCurrency = currency;

    if (response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      const shoppingResults = (data.shopping_results as Record<string, unknown>[]) || [];
      if (shoppingResults.length > 0) {
        const top = shoppingResults[0];
        if (typeof top.extracted_price === "number" && top.extracted_price > 0) {
          livePrice = top.extracted_price;
          liveStore = (top.source as string) || store;
          liveCurrency = (top.currency as string) || currency;
          console.log(`[PriceHistory] Live price: ${livePrice} ${liveCurrency} from ${liveStore}`);
        }
      }
    }

    const entry = {
      productId,
      price: livePrice,
      currency: liveCurrency,
      store: liveStore,
      checkedAt: new Date().toISOString(),
    };

    return c.json({
      entry,
      livePrice: livePrice !== price ? livePrice : null,
      dropped: livePrice < price,
      savings: livePrice < price ? price - livePrice : 0,
    });
  } catch (err) {
    console.error("[PriceHistory] Record failed:", err);
    return c.json({ error: "Price history record failed" }, 500);
  }
});

app.get("/db/health", async (c) => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return c.json({
      status: "error",
      message: "Supabase credentials not configured",
      tables: {},
    });
  }

  const tables = [
    "profiles",
    "wishlists",
    "wishlist_items",
    "collaborators",
    "chat_messages",
    "item_assignments",
    "price_alerts",
    "price_history",
  ];

  const tableStatus: Record<string, { exists: boolean; count: number; error?: string }> = {};

  for (const table of tables) {
    try {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/${table}?select=*&limit=1`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (resp.ok) {
        const countResp = await fetch(
          `${supabaseUrl}/rest/v1/${table}?select=*`,
          {
            method: "HEAD",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Prefer: "count=exact",
            },
          }
        );
        const contentRange = countResp.headers.get("content-range");
        const count = contentRange
          ? parseInt(contentRange.split("/")[1] || "0")
          : 0;
        tableStatus[table] = { exists: true, count };
      } else {
        const errorBody = await resp.text();
        tableStatus[table] = {
          exists: false,
          count: 0,
          error: errorBody.substring(0, 100),
        };
      }
    } catch (err) {
      tableStatus[table] = {
        exists: false,
        count: 0,
        error: String(err).substring(0, 100),
      };
    }
  }

  const allExist = Object.values(tableStatus).every((t) => t.exists);

  console.log("[DB Health]", JSON.stringify(tableStatus, null, 2));

  return c.json({
    status: allExist ? "ok" : "missing_tables",
    message: allExist
      ? "All tables exist"
      : "Some tables are missing. Run the SQL migration in your Supabase dashboard.",
    tables: tableStatus,
  });
});

export default app;
