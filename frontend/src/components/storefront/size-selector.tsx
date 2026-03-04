"use client";

import type { ProductVariant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variant: ProductVariant) => void;
}

export function SizeSelector({
  variants,
  selectedId,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Size">
      {variants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          role="radio"
          aria-checked={selectedId === variant.id}
          onClick={() => onSelect(variant)}
          className={cn(
            "flex flex-col items-center border px-5 py-3 transition-colors duration-200",
            selectedId === variant.id
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground/50 hover:bg-muted"
          )}
        >
          <span className="text-sm font-bold">{variant.size}</span>
          <span className="mt-1 text-sm">
            {formatCurrency(variant.price)}
          </span>
        </button>
      ))}
    </div>
  );
}
