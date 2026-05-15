"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeHeight, setActiveHeight] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cRect = carousel.getBoundingClientRect();
    const center = cRect.left + cRect.width / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;
      const r = slide.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const activeSlide = slideRefs.current[bestIdx];
    const img = activeSlide?.querySelector("img");
    if (img) {
      const h = img.getBoundingClientRect().height;
      if (h > 0) setActiveHeight(h);
    }
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };

    measure();
    carousel.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      carousel.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [measure, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Mobile: horizontal scroll carousel, height animates to match the centered slide */}
      <div
        ref={carouselRef}
        className="md:hidden -mx-4 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide transition-[height] duration-300 ease-out"
        style={{ height: activeHeight, scrollSnapType: "x mandatory" }}
      >
        {images.map((img, i) => (
          <div
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            key={img.src}
            className="relative shrink-0 w-screen snap-start snap-always self-start"
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={0}
              height={0}
              sizes="100vw"
              quality={75}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="no-save-img w-full h-auto block"
              priority={i === 0}
              onLoad={measure}
            />
          </div>
        ))}
      </div>

      {/* Desktop: stacked vertical */}
      <div
        className="hidden md:flex flex-col w-[90%] mx-auto"
        onContextMenu={(e) => e.preventDefault()}
      >
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={0}
            height={0}
            sizes="50vw"
            quality={75}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className="no-save-img w-full h-auto block"
            priority={i === 0}
          />
        ))}
      </div>
    </>
  );
}
