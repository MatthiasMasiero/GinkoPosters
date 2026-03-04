"use client";

import { useEffect, useState } from "react";

export function useScrollDirection(threshold = 50) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      setIsAtTop(currentY < 10);

      if (Math.abs(currentY - lastScrollY) < threshold) return;

      setScrollDirection(currentY > lastScrollY ? "down" : "up");
      lastScrollY = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { scrollDirection, isAtTop };
}
