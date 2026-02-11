import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const minPrice = product.variants.length
    ? Math.min(...product.variants.filter((v) => v.is_active).map((v) => v.price))
    : 0;

  return (
    <Link
      href={`/storefront/products/${product.id}`}
      className="group block"
    >
      {/* Image placeholder - 3:4 aspect ratio for posters */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <span className="text-sm text-muted-foreground/50">
              {product.title}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium tracking-tight">{product.title}</h3>
        {minPrice > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            From {formatCurrency(minPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
