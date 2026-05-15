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
  // "grid bottom crosses viewport center". The progress is split into one slice
  // per row (2-col mobile grid), so both cards in a row activate together as
  // the user scrolls down. Mobile only — desktop keeps the hover behavior.
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
      const COLS = 2;
      const rowCount = Math.ceil(products.length / COLS);

      if (progress >= 1) {
        // At the page-end cap: keep the last row active until they scroll back.
        // Otherwise (user scrolled past the grid into footer/etc): deactivate.
        setActiveIndex(cappedByPageEnd ? (rowCount - 1) * COLS : -1);
        return;
      }

      const activeRow = Math.min(rowCount - 1, Math.floor(progress * rowCount));
      setActiveIndex(activeRow * COLS);
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
      {products.map((product, index) => {
        const isActive =
          activeIndex >= 0 && Math.floor(index / 2) === Math.floor(activeIndex / 2);
        return (
          <FadeIn key={product.id} delay={index * 50}>
            <ProductCard product={product} isActive={isActive} />
          </FadeIn>
        );
      })}
    </div>
  );
}
