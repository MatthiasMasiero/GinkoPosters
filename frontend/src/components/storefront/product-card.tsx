"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useArtist } from "@/hooks/use-artist";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { artist } = useArtist();
  const minPrice = product.variants.length
    ? Math.min(...product.variants.map((v) => v.price))
    : 0;

  const href = artist?.slug
    ? `/storefront/products/${product.id}?artist=${artist.slug}`
    : `/storefront/products/${product.id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-transparent bg-muted transition-all duration-500 hover:border-foreground/20">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground/50">
              {product.title}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.02em]">
          {product.title}
        </h3>
        {minPrice > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            From {formatCurrency(minPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
