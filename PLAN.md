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

**4. Stores not properly filtered by country** ✅ FIXED
- Search results now use confirmed stores (from SerpAPI verification) as the primary filter
- Falls back to configured available stores only when no confirmed stores exist
- Home page trending also uses confirmed stores pool

---

### 🟠 High Priority Issues (Incorrect Behaviour)

**5. Currency converter always shows USD as source** ✅ FIXED
- Converter now has a tappable "from" currency that cycles through common currencies (USD, EUR, GBP, JPY, CAD, AUD)
- Converts to the user's selected currency

**6. Home page trending uses hardcoded "USD" currency fallback** ✅ FIXED
- serpToProduct now uses user's currencyCode as fallback instead of hardcoded "USD"

**7. Search results not filtered to country-available stores** ✅ FIXED
- filteredSerpResults now uses confirmedStores (verified by SerpAPI) as primary filter pool
- Falls back to availableStores only when no confirmed stores exist
- Added confirmedStores to the dependency array

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
- Store filtering uses verified stores from SerpAPI

---

## All Proposed Fixes — Implemented

- [x] **Signup flow** — Country selection step added to signup
- [x] **Onboarding** — 4th slide with interactive country picker
- [x] **Remove all "US/USD" defaults** — Starting state is empty, waits for real selection
- [x] **Unify country/currency state** — WishlistProvider no longer duplicates location state
- [x] **Store filtering** — Search results filtered by confirmed/available stores
- [x] **Currency converter** — Tappable source currency, converts to user's selected currency
- [x] **Currency fallback consistency** — All hardcoded "USD" fallbacks replaced
- [x] **Country stored as code** — Country code saved to database profile
