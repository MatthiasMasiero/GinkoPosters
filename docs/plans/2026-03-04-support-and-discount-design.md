# Support Page & Same-Artist Multi-Item Discount

## Support Page (`/storefront/support`)

A full support page with FAQ, shipping/returns info, and contact section.

### Sections

1. **Hero** - "How can we help?" heading
2. **FAQ** - Accordion Q&A (shipping times, returns, print quality, custom orders)
3. **Shipping & Returns** - Processing time, shipping costs, return window
4. **Contact** - Email card with `Ginkoposters@gmail.com` as mailto link

### Navigation

Add "Support" link to:
- Footer Info column
- Desktop header nav
- Mobile sidebar nav

### Styling

Matches existing storefront: Tailwind, OKLCH colors, page-enter animation, Archivo font.

---

## Same-Artist 15% Discount

When a customer has 2+ items from the same artist in their cart, all items from that artist get 15% off.

### Logic

- Group cart items by `artist_id`
- For artists with 2+ items: apply 15% discount to all their items
- Export `discount` and `discountedSubtotal` from cart context
- Constant: `MULTI_ITEM_DISCOUNT_RATE = 0.15`

### Visual Display

- **Cart item**: Original price crossed out, discounted price in accent color, "15% off" badge
- **Cart summary**: "Multi-item discount" line showing savings (between subtotal and shipping)
- **Product page**: Banner when user already has an item from this artist: "Add another and get 15% off!"

---

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/lib/constants.ts` | Add `MULTI_ITEM_DISCOUNT_RATE` |
| `frontend/src/contexts/cart-context.tsx` | Discount calculation logic |
| `frontend/src/components/storefront/cart-item.tsx` | Show discounted prices |
| `frontend/src/components/storefront/cart-summary.tsx` | Show discount line |
| `frontend/src/app/storefront/products/[id]/page.tsx` | Discount incentive banner |
| `frontend/src/app/storefront/support/page.tsx` | New support page |
| `frontend/src/components/layout/storefront-footer.tsx` | Add support link |
| `frontend/src/components/layout/storefront-header.tsx` | Add support link |
| `frontend/src/components/layout/mobile-nav-sidebar.tsx` | Add support link |

## Approach

Frontend-only implementation. No backend changes needed. Discount is calculated client-side in cart context. Stripe checkout session created server-side validates final pricing.
