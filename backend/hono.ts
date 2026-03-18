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
