"use client";

import { formatCurrency } from "@/lib/utils";
import { SHIPPING_COST } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const shipping = itemCount > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

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
