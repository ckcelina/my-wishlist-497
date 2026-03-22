# Full App Audit & Fix Plan


## Issues Found — Organized by Priority

---

### 🔴 Critical Issues (Broken Core Flows)

**1. No country/currency collected during signup** ✅ FIXED
- Signup screen now includes a country picker before account creation
- Country is saved to both the database profile and local storage on signup

**2. Default country is always hardcoded to USA** ✅ FIXED
- Location system now starts with empty state (no country/currency)
- Removed all `|| "USD"` fallbacks from LocationProvider
- Format function gracefully falls back to the product's own currency when user currency is not set

**3. Country from profile never syncs on app start** ✅ FIXED
- Profile sync now works correctly even when local storage is empty
- Added fallback: if country is set but currency is missing, currency syncs from country data
- Enhanced logging for sync debugging

**4. Stores not properly filtered by country** ✅ FIXED → SIMPLIFIED
- Removed trusted stores filtering entirely — Google Shopping's `gl` parameter handles country filtering
- Removed confirmed stores verification system (was making extra API calls and adding complexity)
- Search now goes directly to Google Shopping via SerpAPI with the user's country code
- Category searches simplified to just use category name (no store names appended)

---

### 🟠 High Priority Issues (Incorrect Behaviour)

**5. Currency converter always shows USD as source** ✅ FIXED
- Converter now has a tappable "from" currency that cycles through common currencies (USD, EUR, GBP, JPY, CAD, AUD)
- Converts to the user's selected currency

**6. Home page trending uses hardcoded "USD" currency fallback** ✅ FIXED
- serpToProduct now uses user's currencyCode as fallback instead of hardcoded "USD"

**7. Search results not filtered to country-available stores** ✅ REDESIGNED
- Removed store-based filtering — Google Shopping already filters by country via `gl` parameter
- Removed "Verified Stores" section from Explore page (was unreliable and confusing)
- Removed auto-verify API calls that wasted SerpAPI credits on page load
- All search results now come directly from Google Shopping for the user's country

**8. Price display inconsistency** ✅ FIXED
- LocationProvider format() now gracefully handles empty currencyCode
- Uses product's own currency when user currency is not yet set
- Product detail page uses user's currency as fallback for parsed serpData

---

### 🟡 Medium Priority Issues (Missing Features/Polish)

**9. Onboarding doesn't ask for country** ✅ FIXED (previously)
- Onboarding now has a 4th step with country picker
- Country is saved before navigating to home screen

**10. Profile country stored as full name (fragile matching)** ✅ FIXED
- setCountry() saves country code (e.g. "JO") to the database profile
- Profile sync handles both code and name lookups via getCountryByCode() ?? getCountryByName()

**11. Wishlist system holds its own copy of country/currency (duplicate state)** ✅ FIXED
- WishlistProvider user object no longer copies country/currency from profile
- Country/currency are always empty strings in user object — all location data comes from LocationProvider

---

### ✅ What's Working Well
- Country picker, city picker, and currency picker in Profile all work correctly
- Switching country in Profile does update stores, search, and currency symbol properly
- Price history, price alerts, product search, and visual/barcode/link scanning all connect correctly to the backend
- Auth flow (login, logout, session persistence) is solid
- Theme switching and dark mode work
- Signup collects country during registration
- Onboarding asks for country on first run
- Currency converter uses tappable source currency
- Search uses Google Shopping directly (no intermediate store filtering)
- Visual search has improved error handling with fallback to AI detection
- Backend image upload tries multiple hosts with graceful fallback

---

## All Proposed Fixes — Implemented

- [x] **Signup flow** — Country selection step added to signup
- [x] **Onboarding** — 4th slide with interactive country picker
- [x] **Remove all "US/USD" defaults** — Starting state is empty, waits for real selection
- [x] **Unify country/currency state** — WishlistProvider no longer duplicates location state
- [x] **Store filtering** — Removed store filtering in favor of direct Google Shopping (country-based via `gl` param)
- [x] **Currency converter** — Tappable source currency, converts to user's selected currency
- [x] **Currency fallback consistency** — All hardcoded "USD" fallbacks replaced
- [x] **Country stored as code** — Country code saved to database profile
- [x] **Search simplification** — Removed trusted stores system, auto-verify, confirmed stores tracking
- [x] **Visual search reliability** — Backend tries multiple upload hosts, graceful fallback when all fail
- [x] **Image search error handling** — AI detection works as fallback when visual search fails
- [x] **Category search fix** — Categories search by name only, no store names appended
- [x] **Explore page cleanup** — Removed Verified Stores section, removed auto-deal-loading on mount
