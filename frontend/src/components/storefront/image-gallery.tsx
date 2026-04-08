"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setTimeout(() => setShowSwipeHint(false), 2000);
    return () => clearTimeout(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-0 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden md:flex-col md:gap-4 md:overflow-visible"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((img, i) => (
          <div
            key={img.src}
            className="min-w-full snap-center md:min-w-0 relative aspect-[3/4] overflow-hidden bg-muted"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i < 2}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          {/* Mobile image counter — increased to 12px with stronger backdrop */}
          <div className="absolute right-3 top-3 z-10 bg-black/60 px-2 py-1 text-[12px] font-bold uppercase tracking-wider text-white backdrop-blur-sm md:hidden">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Left/right arrow affordance — visible on mobile only */}
          {activeIndex > 0 && (
            <div className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 text-white backdrop-blur-sm md:hidden">
              ‹
            </div>
          )}
          {activeIndex < images.length - 1 && (
            <div className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 text-white backdrop-blur-sm md:hidden">
              ›
            </div>
          )}

          {/* Swipe hint — fades out after 2 seconds, mobile only */}
          <div
            className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 bg-black/50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm transition-opacity duration-700 md:hidden"
            style={{ opacity: showSwipeHint ? 1 : 0 }}
            aria-hidden="true"
          >
            Swipe to browse
          </div>
        </>
      )}
    </div>
  );
}
