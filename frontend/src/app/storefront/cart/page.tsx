"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CartItemRow } from "@/components/storefront/cart-item";
import { CartSummary } from "@/components/storefront/cart-summary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  return (
    <div className="px-6 py-12 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-light tracking-tight">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link
              href="/storefront"
              className="mt-4 inline-block text-sm underline"
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
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                </div>
              ))}

              <Separator className="mt-2" />

              <Link
                href="/storefront"
                className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
              >
                &larr; Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div>
              <CartSummary subtotal={subtotal} itemCount={itemCount} />
              <Link href="/storefront/checkout" className="mt-4 block">
                <Button className="w-full" size="lg">
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
