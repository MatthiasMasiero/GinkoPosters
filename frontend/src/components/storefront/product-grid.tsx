"use client";

import { useEffect, useRef, useState } from "react";
import { FadeIn } from "@/components/landing/fade-in";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  // -1 means no card is currently active (grid not yet at viewport center, or past it).
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Drive the active card from the page's scroll depth through the grid section.
  // Progress 0 → 1 spans from "grid top crosses viewport center" to
  // "grid bottom crosses viewport center". The progress is split into N equal
  // slices, one per card, so cards activate sequentially in DOM order
  // (L1 → R1 → L2 → R2 …) as the user scrolls down. Mobile only — desktop
  // keeps the hover behavior.
  useEffect(() => {
    if (products.length === 0) return;
    const grid = gridRef.current;
    if (!grid) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.innerWidth >= 768) {
        setActiveIndex(-1);
        return;
      }
      const rect = grid.getBoundingClientRect();
      if (rect.height <= 0) return;
      const viewportH = window.innerHeight;
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - viewportH;

      // Define the active scroll range:
      // start: grid top reaches viewport center (card 0 activates)
      // end:   grid bottom reaches viewport center, OR page max-scroll if the
      //        grid sits at the bottom and that point is unreachable
      //        (otherwise the last cards would never activate).
      const gridTopDoc = scrollY + rect.top;
      const gridBottomDoc = scrollY + rect.bottom;
      const startScroll = gridTopDoc - viewportH / 2;
      const naturalEndScroll = gridBottomDoc - viewportH / 2;
      const endScroll = Math.min(naturalEndScroll, maxScroll);
      const cappedByPageEnd = naturalEndScroll > maxScroll;
      const range = endScroll - startScroll;

      if (range <= 0) {
        setActiveIndex(-1);
        return;
      }

      const progress = (scrollY - startScroll) / range;
      if (progress < 0) {
        setActiveIndex(-1);
        return;
      }
      if (progress >= 1) {
        // At the page-end cap: keep the last card active until they scroll back.
        // Otherwise (user scrolled past the grid into footer/etc): deactivate.
        setActiveIndex(cappedByPageEnd ? products.length - 1 : -1);
        return;
      }

      const idx = Math.min(
        products.length - 1,
        Math.floor(progress * products.length)
      );
      setActiveIndex(idx);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [products.length]);

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No products available yet.
      </p>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4">
      {products.map((product, index) => (
        <FadeIn key={product.id} delay={index * 50}>
          <ProductCard product={product} isActive={index === activeIndex} />
        </FadeIn>
      ))}
    </div>
  );
}
