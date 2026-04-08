"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useArtist } from "@/hooks/use-artist";
import { CartItemRow } from "@/components/storefront/cart-item";
import { CartSummary } from "@/components/storefront/cart-summary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount, isItemDiscounted, discount, discountedSubtotal } = useCart();
  const { artist } = useArtist();
  const artistParam = artist?.slug ? `?artist=${artist.slug}` : "";

  return (
    <div className="page-enter px-4 py-12 pt-16 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link
              href={`/storefront${artistParam}`}
              className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground underline transition-colors duration-200 hover:text-foreground"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-12 lg:grid-cols-3">
            {/* Cart items */}
            <div className="lg:col-span-2">
              {items.map((item, i) => (
                <div key={item.variant.id}>
                  {i > 0 && <Separator />}
                  <CartItemRow
                    item={item}
                    discounted={isItemDiscounted(item)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                </div>
              ))}

              <Separator className="mt-2" />

              <Link
                href={`/storefront${artistParam}`}
                className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground hover:underline"
              >
                &larr; Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div>
              <CartSummary subtotal={subtotal} discount={discount} discountedSubtotal={discountedSubtotal} itemCount={itemCount} />
              <Link
                href={items.length > 0 ? `/storefront/checkout${artistParam}` : "#"}
                className={`mt-4 block ${items.length === 0 ? "pointer-events-none" : ""}`}
                aria-disabled={items.length === 0}
                tabIndex={items.length === 0 ? -1 : undefined}
              >
                <Button
                  className="w-full py-6 text-xs font-extrabold uppercase tracking-[0.08em]"
                  size="lg"
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
