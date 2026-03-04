# Support Page & Same-Artist Multi-Item Discount — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full support page with FAQ/contact info and a 15% discount when customers buy 2+ items from the same artist.

**Architecture:** Frontend-only changes. Discount logic in cart context, grouping by `artist_id`. Support page as a new Next.js route. No backend changes.

**Tech Stack:** Next.js 16 (React 19), TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react icons.

---

### Task 1: Add discount constant

**Files:**
- Modify: `frontend/src/lib/constants.ts`

**Step 1: Add the constant**

Add at the end of the file:

```typescript
export const MULTI_ITEM_DISCOUNT_RATE = 0.15;
```

**Step 2: Verify build**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/lib/constants.ts
git commit -m "feat: add multi-item discount rate constant"
```

---

### Task 2: Add discount logic to cart context

**Files:**
- Modify: `frontend/src/contexts/cart-context.tsx`

**Step 1: Update the CartContextValue interface**

Replace the existing interface (lines 13-21):

```typescript
interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  isItemDiscounted: (item: CartItem) => boolean;
}
```

**Step 2: Add the import and discount calculation**

Add import at top:

```typescript
import { MULTI_ITEM_DISCOUNT_RATE } from "@/lib/constants";
```

After the existing `subtotal` calculation (line 95-98), add:

```typescript
  // Group items by artist_id and apply 15% discount for artists with 2+ items
  const artistItemCounts = items.reduce<Record<string, number>>((acc, item) => {
    const artistId = item.product.artist_id;
    acc[artistId] = (acc[artistId] || 0) + item.quantity;
    return acc;
  }, {});

  const discountedArtists = new Set(
    Object.entries(artistItemCounts)
      .filter(([, count]) => count >= 2)
      .map(([artistId]) => artistId)
  );

  const discount = items.reduce((sum, item) => {
    if (discountedArtists.has(item.product.artist_id)) {
      return sum + item.variant.price * item.quantity * MULTI_ITEM_DISCOUNT_RATE;
    }
    return sum;
  }, 0);

  const discountedSubtotal = subtotal - discount;

  const isItemDiscounted = useCallback(
    (item: CartItem) => discountedArtists.has(item.product.artist_id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );
```

**Step 3: Update the Provider value**

Add `discount`, `discountedSubtotal`, and `isItemDiscounted` to the Provider value object:

```typescript
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        discountedSubtotal,
        isItemDiscounted,
      }}
```

**Step 4: Verify build**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add frontend/src/contexts/cart-context.tsx
git commit -m "feat: add same-artist multi-item discount logic to cart context"
```

---

### Task 3: Show discounted prices in cart items

**Files:**
- Modify: `frontend/src/components/storefront/cart-item.tsx`

**Step 1: Update CartItemProps and component**

Add a `discounted` prop and update the price display to show crossed-out original + discounted price:

```typescript
"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import type { CartItem as CartItemType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { MULTI_ITEM_DISCOUNT_RATE } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: CartItemType;
  discounted: boolean;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}

export function CartItemRow({
  item,
  discounted,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const originalPrice = item.variant.price * item.quantity;
  const finalPrice = discounted
    ? originalPrice * (1 - MULTI_ITEM_DISCOUNT_RATE)
    : originalPrice;

  return (
    <div className="flex items-start gap-4 py-5">
      {/* Image */}
      <div className="relative aspect-[3/4] w-20 flex-shrink-0 bg-muted">
        {item.product.image_url ? (
          <Image
            src={item.product.image_url}
            alt={item.product.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-[10px] text-muted-foreground/50">
              {item.product.title}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-bold uppercase tracking-[0.02em]">
          {item.product.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.variant.size}
        </p>
        {discounted && (
          <span className="mt-1 inline-block rounded-sm bg-accent-red px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            15% off
          </span>
        )}

        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 transition-colors duration-200"
            onClick={() =>
              onUpdateQuantity(item.variant.id, item.quantity - 1)
            }
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 transition-colors duration-200"
            onClick={() =>
              onUpdateQuantity(item.variant.id, item.quantity + 1)
            }
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {discounted ? (
          <>
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(originalPrice)}
            </span>
            <span className="text-sm font-bold text-accent-red">
              {formatCurrency(finalPrice)}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold">
            {formatCurrency(originalPrice)}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground transition-colors duration-200 hover:text-foreground"
          onClick={() => onRemove(item.variant.id)}
          aria-label={`Remove ${item.product.title}`}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: Update cart page to pass the discounted prop**

In `frontend/src/app/storefront/cart/page.tsx`, update the import and usage:

Change the destructuring (line 12):
```typescript
  const { items, updateQuantity, removeItem, subtotal, itemCount, isItemDiscounted, discount, discountedSubtotal } = useCart();
```

Update `CartItemRow` usage (around line 40-44):
```typescript
                  <CartItemRow
                    item={item}
                    discounted={isItemDiscounted(item)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
```

Update `CartSummary` usage (around line 60):
```typescript
              <CartSummary subtotal={subtotal} discount={discount} discountedSubtotal={discountedSubtotal} itemCount={itemCount} />
```

**Step 3: Verify build**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -5`
Expected: May fail because CartSummary doesn't accept new props yet — that's OK, we fix it in Task 4.

**Step 4: Commit**

```bash
git add frontend/src/components/storefront/cart-item.tsx frontend/src/app/storefront/cart/page.tsx
git commit -m "feat: show discounted prices and 15% off badge in cart items"
```

---

### Task 4: Show discount line in cart summary

**Files:**
- Modify: `frontend/src/components/storefront/cart-summary.tsx`

**Step 1: Update the component**

Replace the full file content:

```typescript
"use client";

import { formatCurrency } from "@/lib/utils";
import { SHIPPING_COST } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, discount, discountedSubtotal, itemCount }: CartSummaryProps) {
  const shipping = itemCount > 0 ? SHIPPING_COST : 0;
  const total = discountedSubtotal + shipping;

  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-sm font-medium uppercase tracking-wider">
        Order Summary
      </h3>
      <Separator className="my-4" />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-accent-red">Multi-item discount</span>
            <span className="text-accent-red">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{itemCount > 0 ? formatCurrency(shipping) : "--"}</span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between font-medium">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
```

**Step 2: Update checkout page to pass new props**

In `frontend/src/app/storefront/checkout/page.tsx`, update the destructuring (line 9):

```typescript
  const { items, subtotal, itemCount, discount, discountedSubtotal } = useCart();
```

Update `CartSummary` usage (line 43):

```typescript
            <CartSummary subtotal={subtotal} discount={discount} discountedSubtotal={discountedSubtotal} itemCount={itemCount} />
```

**Step 3: Verify build**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add frontend/src/components/storefront/cart-summary.tsx frontend/src/app/storefront/checkout/page.tsx
git commit -m "feat: show multi-item discount line in cart and checkout summaries"
```

---

### Task 5: Add discount incentive banner on product page

**Files:**
- Modify: `frontend/src/app/storefront/products/[id]/page.tsx`

**Step 1: Add cart hook usage and banner**

The component already imports `useCart` but only uses `addItem`. Update to also get `items`:

Change line 19:
```typescript
  const { addItem, items } = useCart();
```

Add this check after the existing state declarations (after line 27):

```typescript
  // Check if user already has an item from this product's artist
  const hasArtistItemInCart = product
    ? items.some((item) => item.product.artist_id === product.artist_id)
    : false;
```

Add the banner right after the "Back to store" link (after line 85, before the grid div):

```typescript
        {hasArtistItemInCart && (
          <div className="mb-8 border border-accent-red/20 bg-accent-red/5 px-4 py-3 text-sm">
            <span className="font-bold text-accent-red">15% off</span>
            <span className="ml-1 text-muted-foreground">
              — you have another item from this artist in your cart. Add this one for a discount!
            </span>
          </div>
        )}
```

**Step 2: Verify build**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/storefront/products/[id]/page.tsx
git commit -m "feat: show 15% discount incentive banner when artist item already in cart"
```

---

### Task 6: Create the support page

**Files:**
- Create: `frontend/src/app/storefront/support/page.tsx`

**Step 1: Create the support page**

```typescript
"use client";

import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { SHIPPING_COST } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders are typically printed and shipped within 3-5 business days. Delivery takes an additional 3-7 business days depending on your location within Europe.",
  },
  {
    question: "What is the print quality like?",
    answer:
      "All posters are printed on premium 200gsm matte paper using archival-quality inks. Colours are vibrant and long-lasting, designed to look great on your wall for years.",
  },
  {
    question: "Can I return or exchange a poster?",
    answer:
      "Since every poster is printed on demand, we cannot accept returns for change of mind. However, if your order arrives damaged or there is a printing defect, contact us within 14 days and we will send a replacement at no cost.",
  },
  {
    question: "Do you ship outside Europe?",
    answer:
      "Currently we ship within the EU. We are working on expanding to other regions — reach out to us if you have questions about international orders.",
  },
  {
    question: "Can I request a custom size?",
    answer:
      "At the moment we offer A4, A3, A2, and A1 sizes. If you need a custom size, contact us and we will see what we can do.",
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer:
      "Yes! If you are interested in ordering multiple prints for a business, event, or gift, reach out to us and we can arrange special pricing.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-sm font-medium transition-colors hover:text-foreground/80"
      >
        {question}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="page-enter px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">
          How can we help?
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Find answers to common questions or get in touch with our team.
        </p>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">
            Frequently Asked Questions
          </h2>
          <div className="mt-6">
            {FAQ_ITEMS.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </section>

        {/* Shipping & Returns */}
        <section className="mt-16">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">
            Shipping &amp; Returns
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Processing:</span>{" "}
              All orders are printed on demand and typically ship within 3-5 business days.
            </p>
            <p>
              <span className="font-medium text-foreground">Shipping cost:</span>{" "}
              Flat rate of {formatCurrency(SHIPPING_COST)} per order within the EU.
            </p>
            <p>
              <span className="font-medium text-foreground">Delivery:</span>{" "}
              3-7 business days after dispatch, depending on your location.
            </p>
            <p>
              <span className="font-medium text-foreground">Returns:</span>{" "}
              Since items are printed on demand, we do not accept returns for change of mind.
              If your order arrives damaged or defective, contact us within 14 days for a free replacement.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-16">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">
            Contact Us
          </h2>
          <div className="mt-6 border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-foreground text-background">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Email us</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Have a question, issue, or special request? We typically respond within 24 hours.
                </p>
                <a
                  href="mailto:Ginkoposters@gmail.com"
                  className="mt-3 inline-block text-sm font-bold underline transition-colors duration-200 hover:text-foreground/80"
                >
                  Ginkoposters@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/storefront/support/page.tsx
git commit -m "feat: add support page with FAQ, shipping info, and contact email"
```

---

### Task 7: Add support link to footer, header, and mobile nav

**Files:**
- Modify: `frontend/src/components/layout/storefront-footer.tsx`
- Modify: `frontend/src/components/layout/storefront-header.tsx`
- Modify: `frontend/src/components/layout/mobile-nav-sidebar.tsx`

**Step 1: Add Support link to footer**

In `storefront-footer.tsx`, in the Info column nav (after the GinkoPosters link, around line 57), add:

```typescript
              <Link
                href={`/storefront/support${artistParam}`}
                className="text-sm text-background/60 transition-colors duration-200 hover:text-background"
              >
                Support
              </Link>
```

**Step 2: Add Support link to desktop header nav**

In `storefront-header.tsx`, add a new link after the "Shop" link (after line 63, before the cart link):

```typescript
        <Link
          href={`/storefront/support${artistParam}`}
          className="group relative text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <span className="transition-opacity duration-200 group-hover:opacity-0">
            Support
          </span>
          <span className="absolute inset-0 italic opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Support
          </span>
        </Link>
```

**Step 3: Add Support link to mobile sidebar**

In `mobile-nav-sidebar.tsx`, add a new link after the Cart link (after line 52, before the divider):

```typescript
          <SheetClose asChild>
            <Link
              href={`/storefront/support${artistParam}`}
              className="min-h-[48px] px-8 py-5 text-2xl font-extrabold uppercase tracking-tight transition-colors hover:bg-muted"
            >
              Support
            </Link>
          </SheetClose>
```

**Step 4: Verify build**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add frontend/src/components/layout/storefront-footer.tsx frontend/src/components/layout/storefront-header.tsx frontend/src/components/layout/mobile-nav-sidebar.tsx
git commit -m "feat: add support link to footer, header, and mobile nav"
```

---

### Task 8: Final verification

**Step 1: Full build check**

Run: `cd frontend && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds with no errors

**Step 2: Manual smoke test checklist**

- [ ] Visit `/storefront/support` — FAQ accordion works, email link opens mail client
- [ ] Add 1 item to cart — no discount shown
- [ ] Add 2nd item from same artist — 15% off badge appears, prices crossed out, discount line in summary
- [ ] Visit product page when artist item in cart — banner appears
- [ ] Support link visible in header, footer, and mobile menu
