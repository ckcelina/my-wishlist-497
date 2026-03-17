import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
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
