"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { CartSummary } from "@/components/storefront/cart-summary";

export default function CheckoutPage() {
  const { items, subtotal, itemCount, discount, discountedSubtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="px-4 py-24 pt-16 text-center md:px-12">
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
    <div className="page-enter px-4 py-12 pt-16 md:px-12">
      <div className="mx-auto max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
          <span className="text-muted-foreground">1. Cart</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-foreground underline underline-offset-4">2. Checkout</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-muted-foreground">3. Confirmation</span>
        </div>

        <h1 className="text-3xl font-extrabold uppercase tracking-tight">
          Checkout
        </h1>

        <div className="mt-8 grid gap-12 lg:grid-cols-3">
          {/* Shipping form */}
          <div className="lg:col-span-2">
            {/* Back to cart link */}
            <Link
              href="/storefront/cart"
              className="mb-6 inline-block text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              &larr; Back to Cart
            </Link>
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
