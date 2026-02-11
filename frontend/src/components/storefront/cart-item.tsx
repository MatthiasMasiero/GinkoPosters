"use client";

import { Minus, Plus, X } from "lucide-react";
import type { CartItem as CartItemType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      {/* Image placeholder */}
      <div className="aspect-[3/4] w-20 flex-shrink-0 rounded bg-muted">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.title}
            className="h-full w-full rounded object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-gradient-to-br from-muted to-muted-foreground/10">
            <span className="text-[10px] text-muted-foreground/50">
              {item.product.title}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-medium">{item.product.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.variant.size_label} &mdash; {item.variant.width_cm} x{" "}
          {item.variant.height_cm} cm
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              onUpdateQuantity(item.variant.id, item.quantity - 1)
            }
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              onUpdateQuantity(item.variant.id, item.quantity + 1)
            }
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-sm font-medium">
          {formatCurrency(item.variant.price * item.quantity)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onRemove(item.variant.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
