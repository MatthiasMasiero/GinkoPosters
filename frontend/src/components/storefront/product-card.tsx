"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useArtist } from "@/hooks/use-artist";


interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { artist } = useArtist();

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
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {images.length > 0 ? (
          <>
            {images.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={i === 0 ? product.title : `${product.title} - view ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 ease-out group-hover:scale-[1.02] ${
                  i === 0
                    ? `opacity-100 ${hasMultipleImages ? "md:group-hover:opacity-0" : ""}`
                    : i === activeIndex
                      ? "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      : "opacity-0 md:group-hover:opacity-100"
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

            {/* Semi-transparent add to cart — bottom right */}
            <div className="absolute bottom-2 right-2 z-10">
              <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/60">
                + Cart
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground/50">
              {product.title}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
