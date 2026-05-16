# US Imperial Poster Sizes — Design

**Date:** 2026-05-15
**Status:** Approved
**Approach:** Display-layer mapping (Approach A)

## Problem

US customers expect poster sizes in imperial inches (12×18″, 16×24″, 20×30″,
24×36″), not ISO A-series (A4–A1). The store auto-detects US visitors and
already shows US USD prices, but sizes are still labelled A4/A3/A2/A1
everywhere. We want US visitors to automatically see imperial size labels that
correlate to the existing A-series sizes and their existing US prices, with no
change to internal data, fulfilment, or admin.

## Decisions

- **Mapping (positional 1:1, user-confirmed):**
  - A4 → 12×18″
  - A3 → 16×24″
  - A2 → 20×30″
  - A1 → 24×36″
- **Pricing:** Reuse existing US prices unchanged. Because pricing is keyed by
  the A-series size and the mapping is positional, the correct US price already
  attaches to each imperial label automatically:
  - 12×18″ = $16.98 (A4)
  - 16×24″ = $17.98 (A3)
  - 20×30″ = $19.98 (A2)
  - 24×36″ = $27.98 (A1)
- **Scope:** Display-layer only. `variant.size` stays the A-series string
  everywhere internal — DB, SKU, printer payload, admin form, cart logic,
  checkout payload, pricing lookups. Only the customer-facing rendered label
  changes, and only when the detected region is `US`.

## Architecture

Existing relevant flow:

- `ProductVariant.size` is a string key (A4/A3/A2/A1) used as the lookup key
  into `REGIONAL_PRICING[region].prices` and carried through cart/checkout.
- Region is detected from the `user_country` cookie in
  `region-context.tsx` via a `useEffect`, then `getRegionFromCountry`.
- `RegionContextValue` already exposes `getPrice(size)` and
  `formatPrice(amount)` bound to the current region. Components consume these
  via `useRegion()`.

Customer-facing size-label render sites (verified exhaustively):

1. `components/storefront/size-selector.tsx:36` — `{variant.size}` button label
2. `components/storefront/cart-item.tsx:56` — `{item.variant.size}` line item

The product-page add-to-cart button is price-only; the order-confirmation page
renders no size string. No other customer-facing size labels exist.

## Components

### 1. Mapping constant + pure helper

In `frontend/src/lib/regional-pricing.ts` (co-located with region logic):

```ts
export const US_SIZE_LABELS: Record<string, string> = {
  A4: '12×18″',
  A3: '16×24″',
  A2: '20×30″',
  A1: '24×36″',
};

export function getDisplaySize(size: string, region: Region): string {
  if (region === 'US') return US_SIZE_LABELS[size] ?? size;
  return size;
}
```

- `what it does`: maps an internal A-series size string to the label shown to
  the customer for a given region.
- `how to use`: `getDisplaySize(variant.size, region)`.
- `depends on`: `Region` type only. Pure function, trivially unit-testable.

### 2. Region context exposure

In `frontend/src/contexts/region-context.tsx`, add to `RegionContextValue`:

```ts
getSizeLabel: (size: string) => string;
```

Implemented as `const getSizeLabel = (size: string) => getDisplaySize(size, region);`
and added to the provider value, mirroring the existing `getPrice`/`formatPrice`
pattern.

### 3. Wire into the two render sites

- `size-selector.tsx`: destructure `getSizeLabel` from `useRegion()`; replace
  `{variant.size}` with `{getSizeLabel(variant.size)}`.
- `cart-item.tsx`: destructure `getSizeLabel` from `useRegion()`; replace
  `{item.variant.size}` with `{getSizeLabel(item.variant.size)}`.

## Explicitly Out of Scope / Untouched

- `variant.size` data values, DB schema, migrations.
- Cart logic, checkout payload (`variant_id`), pricing lookups.
- Admin product form, admin order views, printer SKU/payload.
- Non-US regions: `getDisplaySize` returns the A-series string unchanged.
- Poster dimension constants (`POSTER_SIZES` in `constants.ts`) — not rendered
  to customers anywhere; no inch-conversion display needed.

## Edge Cases

- **A5 / A0:** not present in `US_SIZE_LABELS`. They aren't creatable via the
  admin form, but if encountered the helper falls through to the original
  label (`?? size`). Map is trivially extendable later.
- **Region detection latency:** region resolves from the cookie inside a
  `useEffect`, so the first paint uses the default region (`WORLD`) and then
  re-renders once the cookie is read. This is identical to existing price
  behaviour, so the size label and price flip together — no new flicker is
  introduced.
- **Unknown size string:** `?? size` passthrough guarantees we never render
  `undefined`.

## Testing

**Unit tests** for `getDisplaySize`:
- `('A4', 'US')` → `'12×18″'`; same for A3/A2/A1.
- `('A4', 'UK')` → `'A4'` (non-US passthrough); spot-check another region.
- `('A0', 'US')` → `'A0'` (unmapped size passthrough).
- `('Z9', 'US')` → `'Z9'` (unknown size passthrough).

**Manual verification:**
- Set `user_country=US` cookie → product size selector and cart line items
  show imperial labels with USD prices ($16.98 / $17.98 / $19.98 / $27.98).
- Clear cookie / set a non-US country → labels revert to A4–A1.
- Confirm checkout payload still sends the A-series `variant_id`/size and the
  admin order view still shows A-series.
