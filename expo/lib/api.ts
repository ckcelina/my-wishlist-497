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
  snippet: string;
}

export interface ScrapeResult {
  title: string;
  image: string;
  description: string;
  price: number;
  store: string;
  url: string;
  error: string | null;
}

export async function scrapeProductUrl(
  url: string
): Promise<ScrapeResult> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { title: "", image: "", description: "", price: 0, store: "", url, error: "API URL not configured" };
    }

    console.log(`[API] Scraping URL: ${url}`);
    const response = await fetch(`${baseUrl}/api/scrape/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { title: "", image: "", description: "", price: 0, store: "", url, error: (errorData as Record<string, string>).error || `Request failed: ${response.status}` };
    }

    const data = await response.json();
    return data as ScrapeResult;
  } catch (err) {
    console.error("[API] Scrape failed:", err);
    return { title: "", image: "", description: "", price: 0, store: "", url, error: "Network error" };
  }
}

export async function searchProducts(
  query: string,
  country: string = "us"
): Promise<{ results: SerpApiResult[]; error: string | null }> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { results: [], error: "API URL not configured" };
    }

    console.log(`[API] Searching products: ${query}`);
    const response = await fetch(`${baseUrl}/api/search/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, country }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { results: [], error: (errorData as Record<string, string>).error || `Request failed: ${response.status}` };
    }

    const data = await response.json();
    return data as { results: SerpApiResult[]; error: string | null };
  } catch (err) {
    console.error("[API] Search failed:", err);
    return { results: [], error: "Network error" };
  }
}
