import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
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
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return c.json({ error: `Failed to fetch URL: ${response.status}` }, 502);
    }

    const html = await response.text();
    const truncated = html.substring(0, 15000);

    const titleMatch = truncated.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = truncated.match(/property="og:title"\s+content="([^"]+)"/i) ||
      truncated.match(/content="([^"]+)"\s+property="og:title"/i);
    const ogImageMatch = truncated.match(/property="og:image"\s+content="([^"]+)"/i) ||
      truncated.match(/content="([^"]+)"\s+property="og:image"/i);
    const ogDescMatch = truncated.match(/property="og:description"\s+content="([^"]+)"/i) ||
      truncated.match(/content="([^"]+)"\s+property="og:description"/i);
    const priceMatch = truncated.match(/"price"\s*:\s*"?([\d.]+)"?/i) ||
      truncated.match(/\$([\d,.]+)/);

    const productTitle = ogTitleMatch?.[1] || titleMatch?.[1] || "";
    const productImage = ogImageMatch?.[1] || "";
    const productDesc = ogDescMatch?.[1] || "";
    const productPrice = priceMatch?.[1] ? parseFloat(priceMatch[1].replace(",", "")) : 0;

    let storeName = "";
    try {
      const urlObj = new URL(url);
      storeName = urlObj.hostname.replace("www.", "").split(".")[0];
      storeName = storeName.charAt(0).toUpperCase() + storeName.slice(1);
    } catch {
      storeName = "Unknown Store";
    }

    console.log("[Scrape] Extracted:", { productTitle, storeName, productPrice });

    return c.json({
      title: productTitle,
      image: productImage,
      description: productDesc,
      price: productPrice,
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
    const { query, country = "us" } = body as { query: string; country?: string };

    if (!query) {
      return c.json({ results: [], error: "Query is required" }, 400);
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      console.log("[SerpAPI] No API key configured");
      return c.json({ results: [], error: "SerpAPI key not configured" }, 500);
    }

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      api_key: apiKey,
      gl: country,
      num: "10",
    });

    console.log(`[SerpAPI] Searching for: ${query} in ${country}`);
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!response.ok) {
      console.log(`[SerpAPI] Error: ${response.status} ${response.statusText}`);
      return c.json({ results: [], error: `SerpAPI returned ${response.status}` }, 502);
    }

    const data = await response.json();
    const shoppingResults = (data as Record<string, unknown>).shopping_results as Record<string, unknown>[] || [];

    const results = shoppingResults.slice(0, 10).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "",
      price: typeof item.extracted_price === "number" ? item.extracted_price : 0,
      currency: (item.currency as string) || "USD",
      store: (item.source as string) || "Unknown",
      link: (item.link as string) || "",
      image: (item.thumbnail as string) || "",
      rating: typeof item.rating === "number" ? item.rating : undefined,
      snippet: (item.snippet as string) || "",
    }));

    console.log(`[SerpAPI] Found ${results.length} results`);
    return c.json({ results, error: null });
  } catch (err) {
    console.error("[SerpAPI] Search failed:", err);
    return c.json({ results: [], error: "Search failed" }, 500);
  }
});

export default app;
