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
