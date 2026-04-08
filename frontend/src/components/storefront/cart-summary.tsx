"use client";

import { getRegionalShipping, getRegionalFreeShippingThreshold } from "@/lib/regional-pricing";
import { useRegion } from "@/hooks/use-region";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, discount, discountedSubtotal, itemCount }: CartSummaryProps) {
  const { formatPrice, region } = useRegion();
  const shippingCost = getRegionalShipping(region);
  const threshold = getRegionalFreeShippingThreshold(region);
  const isFreeShipping = discountedSubtotal >= threshold;
  const shipping = itemCount > 0 ? (isFreeShipping ? 0 : shippingCost) : 0;
  const total = discountedSubtotal + shipping;

  return (
    <div className="border p-6">
      <h3 className="text-sm font-medium uppercase tracking-wider">
        Order Summary
      </h3>
      <Separator className="my-4" />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-accent-red">Multi-item discount</span>
            <span className="text-accent-red">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Shipping
            {itemCount > 0 && !isFreeShipping && (
              <span className="ml-1 text-xs text-muted-foreground/60">(calculated at checkout)</span>
            )}
          </span>
          <span>{itemCount > 0 ? (isFreeShipping ? "Free" : formatPrice(shipping)) : "--"}</span>
        </div>
        {itemCount > 0 && !isFreeShipping && (
          <p className="text-xs font-medium text-foreground/70">
            Add {formatPrice(threshold - discountedSubtotal)} more for free shipping!
          </p>
        )}
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between font-medium">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
