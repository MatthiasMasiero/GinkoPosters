"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  duration?: number;
}

const directionClasses: Record<Direction, { hidden: string; visible: string }> = {
  up: { hidden: "translate-y-4", visible: "translate-y-0" },
  down: { hidden: "-translate-y-4", visible: "translate-y-0" },
  left: { hidden: "translate-x-4", visible: "translate-x-0" },
  right: { hidden: "-translate-x-4", visible: "translate-x-0" },
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 600,
}: FadeInProps) {
  const { ref, isInView } = useInView();
  const dir = directionClasses[direction];
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "ease-out",
        isInView
          ? `opacity-100 ${dir.visible}`
          : `opacity-0 ${dir.hidden}`,
        className
      )}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
