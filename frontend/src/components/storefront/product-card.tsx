"use client";

import { useState, useCallback } from "react";
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

  // Build image list: main image + up to 1 gallery image (max 2 total)
  const images: string[] = [];
  if (product.image_url) images.push(product.image_url);
  if (product.gallery_urls?.[0] && images.length < 2) {
    images.push(product.gallery_urls[0]);
  }
  const hasMultipleImages = images.length > 1;

  const [activeIndex, setActiveIndex] = useState(0);

  const handleImageTap = useCallback(
    (e: React.MouseEvent) => {
      // Only cycle images on mobile (md breakpoint = 768px)
      if (!hasMultipleImages || window.innerWidth >= 768) return;
      e.preventDefault();
      e.stopPropagation();
      setActiveIndex((prev) => (prev + 1) % images.length);
    },
    [hasMultipleImages, images.length]
  );

  const href = artist?.slug
    ? `/storefront/products/${product.id}?artist=${artist.slug}`
    : `/storefront/products/${product.id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted transition-shadow duration-500 group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)]">
        {images.length > 0 ? (
          <>
            {images.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={i === 0 ? product.title : `${product.title} - view ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 ease-out group-hover:scale-[1.04] ${
                  i === activeIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {/* Mobile tap zone for image cycling */}
            {hasMultipleImages && (
              <button
                type="button"
                className="absolute inset-0 z-10 md:hidden"
                onClick={handleImageTap}
                aria-label="Next image"
              />
            )}
            {/* Mobile dot indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:hidden">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                      i === activeIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
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
          className="absolute bottom-2 right-2 z-20 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Add to cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
      </div>

      {/* Title, price, and mobile size boxes */}
      <div className="mt-3 text-center md:text-left">
        <h3 className="truncate text-xs font-bold uppercase tracking-[0.02em] transition-colors duration-300 group-hover:text-foreground/70 md:overflow-visible md:text-wrap md:text-sm">
          {product.title}
        </h3>
        {minRegionalPrice > 0 && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatPrice(minRegionalPrice)}
          </p>
        )}
        {/* Mobile size boxes */}
        {sizes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1 md:hidden">
            {sizes.map((size) => (
              <span
                key={size}
                className="border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
