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
  const activeVariants = variants.filter((v) => v.is_active);

  return (
    <div className="flex flex-wrap gap-3">
      {activeVariants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          onClick={() => onSelect(variant)}
          className={cn(
            "flex flex-col items-center rounded-lg border px-5 py-3 transition-colors",
            selectedId === variant.id
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground/50"
          )}
        >
          <span className="text-sm font-medium">{variant.size_label}</span>
          <span className="mt-0.5 text-xs opacity-70">
            {variant.width_cm} x {variant.height_cm} cm
          </span>
          <span className="mt-1 text-sm font-medium">
            {formatCurrency(variant.price)}
          </span>
        </button>
      ))}
    </div>
  );
}
