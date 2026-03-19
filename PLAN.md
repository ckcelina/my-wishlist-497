# 5-Phase Fix: Currency, Plus Button, Lens Selection, 404 Error, Stores List


## Phases Overview

---

### Phase 1 — Quick UX & Currency Fixes *(starting now)*
**Features:**
- **Plus button fix** — Raise the circular "+" button slightly higher in the tab bar so the "Add" label beneath it is fully visible and not clipped
- **Unified currency** — Every price shown in the Add screen's search results will use your selected currency (e.g. showing "£12.99" instead of "$12.99" when you've set GBP), using the real-time conversion already in the app
- **"Add detected product" button fix** — Currently clicking the button without a list selected shows an alert with an OK button that does nothing. Fix: the button will be visually disabled (greyed out) until you tap a wishlist chip, then it activates immediately — no confusing alert

---

### Phase 2 — Google Lens-Style Image Selection
**Features:**
- After uploading/taking a photo in "Scan from Image", a movable selection box appears over the image — just like Google Lens
- Drag the box to the part of the image you want to search (e.g. just the product, not the background)
- The cropped area is sent for AI detection and visual search, giving more precise results

---

### Phase 3 — Fix AI Detection 404 Error
**Features:**
- Investigate and fix the "request failed 404" error that appears when AI tries to detect the product from an image
- Ensure both AI detection and visual search work together correctly

---

### Phase 4 — Price Display Unification App-Wide
**Features:**
- Audit every screen in the app (Home, Explore, Wishlist Detail, Product Detail, Price Alerts) for hardcoded `$` signs
- Replace all with the user's selected currency symbol and conversion throughout the entire app

---

### Phase 5 — Massively Expanded Trusted Stores Per Country
**Features:**
- Research and add a comprehensive list of trusted shopping, delivery, and marketplace sites for every country — including all major e-commerce sites, local supermarket delivery, fashion retailers, electronics stores, food delivery platforms, and more
- Countries currently with empty or minimal store lists (e.g. many African, Asian, and Eastern European nations) will be populated with all verified trusted sites

---

## Starting with Phase 1 now
Fixing the plus button height, currency unification in the Add screen, and the broken "Add detected product" button flow.
