"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { useArtist } from "@/hooks/use-artist";
import { storeUrl } from "@/lib/store-url";


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
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);

  const href = storeUrl(artist, `/products/${product.id}`);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    swipedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swipedRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (!hasMultipleImages) return;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setActiveIndex(dx < 0 ? 1 : 0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (swipedRef.current) {
      e.preventDefault();
      swipedRef.current = false;
    }
  };

  return (
    <Link href={href} className="group block" onClick={handleClick}>
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-muted touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <>
            {images.map((src, i) => {
              // Mobile: slide horizontally based on activeIndex
              // image 0 sits at x=0 / slides off to -100%; image 1 sits at +100% / slides to 0
              const slide =
                i === 0
                  ? activeIndex === 0
                    ? "translate-x-0"
                    : "-translate-x-full"
                  : activeIndex === 1
                    ? "translate-x-0"
                    : "translate-x-full";
              // Desktop: keep both stacked (no slide), opacity-fade on hover
              const desktopOpacity =
                i === 0
                  ? hasMultipleImages
                    ? "md:group-hover:opacity-0"
                    : ""
                  : "md:opacity-0 md:group-hover:opacity-100";
              return (
                <Image
                  key={src}
                  src={src}
                  alt={i === 0 ? product.title : `${product.title} - view ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={70}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className={`no-save-img object-cover opacity-100 transition-transform duration-500 ease-out md:translate-x-0 md:transition-all md:group-hover:scale-[1.02] ${slide} ${desktopOpacity}`}
                />
              );
            })}
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
