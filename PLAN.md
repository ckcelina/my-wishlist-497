# Complete SerpAPI Integration Plan — All App Functions


This plan covers every function in the app that uses or should use SerpAPI for product search, price comparison, and discovery. It details what already exists, what needs to be built, and how each feature connects.

---

## **Currently Built (Backend API Endpoints)**

### 1. Product Search (`POST /search/products`)
- Uses **Google Shopping** engine via SerpAPI
- Accepts: `query`, `country` (gl parameter), `minPrice`, `maxPrice`, `sortBy`
- Returns up to 20 results with: title, price, currency, store, link, image, rating, reviews, snippet, productId, delivery info
- **Used by:** Explore tab search, Add tab (after image detection & URL scrape)

### 2. Product Detail (`POST /search/product-detail`)
- Uses **Google Product** engine via SerpAPI
- Accepts: `productId`, `country`
- Returns: full product info, images, highlights, and list of **online sellers** with prices & delivery info
- **Used by:** Product Detail screen (fetches sellers when a SerpAPI product is opened)

### 3. Cross-Country Price Comparison (`POST /search/compare-prices`)
- Runs **parallel Google Shopping** searches across multiple countries
- Accepts: `query`, `countries[]` (defaults to US, UK, CA, AU)
- Returns top 5 results per country with prices
- **Used by:** Product Detail screen (shows price by country with savings calculation)

### 4. URL Scraping (`POST /scrape/url`)
- Direct HTML fetch + meta tag extraction (no SerpAPI)
- Extracts: title, image, description, price, currency, store name from og:tags and structured data
- **Used by:** Add tab "Paste Link" mode

### 5. Exchange Rates & Conversion (`GET /exchange-rates`, `POST /convert`)
- Static rate table covering 60+ currencies
- **Used by:** Location provider for real-time currency conversion across the entire app

---

## **How Each Screen Uses SerpAPI**

### 🔍 Explore Tab
- **Text search:** User types a query → calls Product Search with their selected country
- **Category tap:** Builds a query like "Electronics UAE" → calls Product Search
- **Store tap:** Builds a query like "Noon UAE" → calls Product Search
- Results show store name, price (converted to user's currency), and delivery info
- Tapping a result opens the Product Detail screen

### ➕ Add Tab
- **Scan from Image:** AI detects product → auto-generates search query → calls Product Search to find matching listings
- **Paste Link:** Scrapes the URL for product info → calls Product Search with the scraped title to find alternatives
- **Manual Entry:** No SerpAPI involved

### 📦 Product Detail Screen
- If product has a SerpAPI `productId`: calls Product Detail to fetch all **online sellers** with prices
- Automatically calls Price Comparison across the user's country + US, UK, UAE, Saudi Arabia
- Shows savings compared to current country's price
- "Visit Store" button opens the seller's actual store link
- Price alert toggle (currently UI-only, no backend persistence)

### 🏠 Home Tab
- Displays wishlists and saved products (no direct SerpAPI calls)
- Products saved from search results retain their SerpAPI data (store link, price, etc.)

### 💬 Chat / Wishlist Sharing
- No direct SerpAPI calls — works with saved product data

### ⚙️ Profile / Settings
- Changing country/currency triggers query invalidation, so next Explore search uses the new country code
- All prices across the app re-convert to the new currency

---

## **Features That Need To Be Built or Improved**

### A. Price Alerts Backend
- **Current state:** Toggle is UI-only, shows an alert message but doesn't persist
- **Needed:** Backend endpoint to save price alerts per product per user, and a mechanism to periodically re-search and compare prices

### B. Trending / Popular Searches
- **Current state:** Shows mock trending products
- **Needed:** Backend endpoint that runs SerpAPI searches for popular categories in the user's country and caches results

### C. Deals & Sales Discovery
- **Current state:** Not built
- **Needed:** A "Deals" section on Explore that searches with `sortBy: "price_low_to_high"` or uses SerpAPI's deal filters

### D. Search History & Suggestions
- **Current state:** No search history saved
- **Needed:** Save recent searches locally, show them as suggestions before the user types

### E. Store-Specific Browsing
- **Current state:** Store chips exist but just trigger a generic search with the store name
- **Needed:** More refined queries per store (e.g., searching within Amazon, Noon, Deliveroo specifically)

### F. Price History Tracking
- **Current state:** Not built
- **Needed:** When a product is saved to a wishlist, periodically re-fetch its price via SerpAPI and store historical prices for chart display

### G. Barcode / Text Search from Camera
- **Current state:** Image detection uses AI to identify products, then searches SerpAPI
- **Enhancement:** Could add barcode scanning that extracts a UPC/EAN and searches SerpAPI with it

### H. Notification System for Price Drops
- **Current state:** Notification type exists in types but no real push notification
- **Needed:** Backend scheduled job that re-searches wishlist items and creates notifications when prices drop

---

## **SerpAPI Usage Flow Summary**

```
User opens Explore → types "AirPods" → 
  Backend: SerpAPI Google Shopping (country=ae) → 20 results
  
User taps a result → Product Detail screen →
  Backend: SerpAPI Google Product (productId) → sellers list
  Backend: SerpAPI Google Shopping × 5 countries → price comparison
  
User scans image → AI detects "Nike Air Max" →
  Backend: SerpAPI Google Shopping → matching products
  
User pastes Amazon link → scrape HTML → title extracted →
  Backend: SerpAPI Google Shopping → alternative listings

User changes country from UAE to UK →
  All cached searches invalidated
  Next search uses gl=uk
  All prices convert to GBP
```

---

## **Backend SerpAPI Endpoints Reference**

| Endpoint | SerpAPI Engine | Parameters | Purpose |
|---|---|---|---|
| `/search/products` | `google_shopping` | q, gl, hl, num, min_price, max_price, sort_by | Main product search |
| `/search/product-detail` | `google_product` | product_id, gl, hl | Seller details for a specific product |
| `/search/compare-prices` | `google_shopping` × N | q, gl (per country), num=5 | Multi-country price comparison |
| `/scrape/url` | None (direct fetch) | URL | Extract product info from any store page |
| `/exchange-rates` | None (static) | — | Currency conversion rates |
| `/convert` | None (static) | amount, from, to | Convert between currencies |

---

## **What Happens When User Changes Country**

1. Location provider updates `countryCode`, `currencyCode`, and `serpApiCountryCode`
2. All React Query caches with key `["search"]` are invalidated
3. Explore tab's next search passes the new country code to SerpAPI
4. All displayed prices convert via the static exchange rate table
5. Available stores list updates to show stores relevant to the new country
6. Product Detail's price comparison includes the new country

This ensures the entire app reflects the user's current location or chosen country instantly.
