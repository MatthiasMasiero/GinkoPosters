"use client";

import type { ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRegion } from "@/hooks/use-region";

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
  const { getPrice, formatPrice, getSizeLabel, filterVariants } = useRegion();

  const displayVariants = filterVariants(variants);

  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Size">
      {displayVariants.map((variant) => (
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
          <span className="text-sm font-bold">{getSizeLabel(variant.size)}</span>
          <span className="mt-1 text-sm">
            {formatPrice(getPrice(variant.price))}
          </span>
        </button>
      ))}
    </div>
  );
}
