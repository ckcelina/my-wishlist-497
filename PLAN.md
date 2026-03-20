# 5-Phase Fix: Currency, Plus Button, Lens Selection, 404 Error, Stores List

## Phases Overview

---

### Phase 1 — Quick UX & Currency Fixes ✅
- [x] Plus button fix — raised higher so "Add" label is visible
- [x] Unified currency in Add screen search results
- [x] "Add detected product" button greyed out until list selected

---

### Phase 2 — Google Lens-Style Image Selection ✅
- [x] ImageSelectionOverlay component with draggable/resizable crop box
- [x] After uploading photo, selection overlay appears before processing
- [x] "Search Selection" crops region via expo-image-manipulator and sends for detection
- [x] "Full Image" option sends entire image as before

---

### Phase 3 — Fix AI Detection 404 Error ✅
- [x] Added retry logic (up to 3 attempts) for 404 errors in generateObject
- [x] Truncate oversized base64 to avoid payload issues
- [x] Graceful fallback — if AI fails, visual search results still shown

---

### Phase 4 — Price Display Unification App-Wide ✅
- [x] ProductCard.tsx — replaced hardcoded `$` with `format(price, currency)`
- [x] wishlist-chat.tsx — replaced hardcoded `$` with `formatPrice(price, currency)`
- [x] product-detail.tsx — replaced hardcoded `"USD"` in seller price with product currency
- [x] explore/index.tsx — replaced hardcoded `"USD"` in converter with user's currencyCode
- [x] add/index.tsx — replaced hardcoded `"USD"` in estimated price and scraped price display

---

### Phase 5 — Massively Expanded Trusted Stores Per Country ✅
- [x] Research comprehensive trusted stores for major countries
- [x] Populate countries with empty/minimal store lists
- [x] Include e-commerce, supermarket delivery, fashion, electronics, food delivery platforms
