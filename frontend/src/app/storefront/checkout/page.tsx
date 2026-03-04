"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { CartSummary } from "@/components/storefront/cart-summary";

export default function CheckoutPage() {
  const { items, subtotal, itemCount, discount, discountedSubtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="px-6 py-24 text-center md:px-12">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link
          href="/storefront"
          className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.08em] underline"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter px-6 py-12 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">
          Checkout
        </h1>

        <div className="mt-8 grid gap-12 lg:grid-cols-3">
          {/* Shipping form */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xs font-extrabold uppercase tracking-[0.08em]">
              Shipping Address
            </h2>
            <CheckoutForm />
          </div>

          {/* Order summary */}
          <div>
            <CartSummary subtotal={subtotal} discount={discount} discountedSubtotal={discountedSubtotal} itemCount={itemCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
