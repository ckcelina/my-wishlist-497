# Full App Audit & Fix Plan


## Issues Found — Organized by Priority

---

### 🔴 Critical Issues (Broken Core Flows)

**1. No country/currency collected during signup**
- The signup screen only asks for name, email, and password — country is never asked
- The onboarding screen shows app features but never asks what country the user is in
- After signup, the profile has no country stored, so the entire app defaults to US/USD

**2. Default country is always hardcoded to USA**
- Location system starts as "US / USD" with no way to know it's just a default
- The wishlist system also independently defaults to "United States / USD" as fallback
- Two separate systems hold country/currency data that can conflict with each other

**3. Country from profile never syncs on app start**
- Even if a user previously saved their country, the app starts as "US" every session
- The sync logic only kicks in if there's no stored value at all — but the default "US" acts as if a value was already stored, blocking the sync

**4. Stores not properly filtered by country**
- Stores that don't ship to the selected country still appear in the Trusted Stores list and search results
- Before the app has verified stores (first load), it falls back to showing ALL configured stores for that country regardless of whether they're confirmed as active
- Home page trending section also shows unconfirmed stores as a fallback

---

### 🟠 High Priority Issues (Incorrect Behaviour)

**5. Currency converter always shows USD as source**
- The converter on the Explore page hardcodes "USD" as the "from" currency
- It should use the user's actual selected currency as the base

**6. Home page trending uses hardcoded "USD" currency fallback**
- When a product's currency is missing, the home screen defaults to "USD" instead of the user's selected currency
- The Explore page correctly uses the user's currency as fallback — these should be consistent

**7. Search results not filtered to country-available stores**
- Searching for products returns results from stores worldwide, including stores that don't ship to the selected country
- Only the "Trusted Stores" chip list filters, but actual search result cards don't get filtered

**8. Price display inconsistency**
- Products added to wishlists store their original currency but aren't always converted to the user's selected currency on display
- Switching countries mid-session doesn't refresh cached prices

---

### 🟡 Medium Priority Issues (Missing Features/Polish)

**9. Onboarding doesn't ask for country**
- After the 3 intro slides, the app jumps straight to the home screen
- The country/city selection step is missing entirely from the first-run experience

**10. Profile country stored as full name (fragile matching)**
- Country is saved to the database as a full name string (e.g. "Jordan") instead of a short code (e.g. "JO")
- Any slight mismatch in spelling, casing, or spacing between database and app will silently break the country sync

**11. Wishlist system holds its own copy of country/currency (duplicate state)**
- Both the location system and the wishlist system store country/currency separately
- When the user changes their country, one system may update while the other remains stale

---

### ✅ What's Working Well
- Country picker, city picker, and currency picker in Profile all work correctly
- Switching country in Profile does update stores, search, and currency symbol properly
- Price history, price alerts, product search, and visual/barcode/link scanning all connect correctly to the backend
- Auth flow (login, logout, session persistence) is solid
- Theme switching and dark mode work

---

## Proposed Fixes

**Signup flow** — Add a country selection step at the end of signup (before the user reaches the home screen), saving their choice immediately to both the database profile and local storage

**Onboarding** — Replace or add a 4th onboarding slide with an interactive country/currency picker so first-time users set their location before seeing the home screen

**Remove all "US/USD" defaults** — Change the starting state from "US/USD" to empty, forcing the app to wait for a real selection from the user

**Unify country/currency state** — Remove the duplicate country/currency fallbacks in the wishlist system so there's only one source of truth (the location system)

**Store filtering** — Apply country-available store filtering directly to search results, not just the trusted stores list; hide stores that haven't been confirmed for the selected country

**Currency converter** — Use the user's actual selected currency as the source side of the converter

**Currency fallback consistency** — Replace all hardcoded "USD" fallbacks with the user's selected currency code

**Country stored as code** — Save the country code (e.g. "JO") to the database profile instead of the full name to make syncing reliable
