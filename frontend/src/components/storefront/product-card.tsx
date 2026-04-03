"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useArtist } from "@/hooks/use-artist";
import { useRegion } from "@/hooks/use-region";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { artist } = useArtist();
  const { getPrice, formatPrice } = useRegion();
  const sizes = product.variants.map((v) => v.size);
  const minRegionalPrice = sizes.length > 0
    ? Math.min(...sizes.map((s) => getPrice(s)))
    : 0;

  const href = artist?.slug
    ? `/storefront/products/${product.id}?artist=${artist.slug}`
    : `/storefront/products/${product.id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted transition-shadow duration-500 group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground/50">
              {product.title}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* Add to cart button */}
        <button
          className="absolute bottom-2 right-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Add to cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
      </div>

      {/* Mobile: centered, truncated title + price + add button */}
      <div className="mt-3 text-center md:text-left">
        <h3 className="truncate text-xs font-bold uppercase tracking-[0.02em] transition-colors duration-300 group-hover:text-foreground/70 md:overflow-visible md:text-wrap md:text-sm">
          {product.title}
        </h3>
        {minRegionalPrice > 0 && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatPrice(minRegionalPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
