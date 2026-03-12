"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FadeIn } from "@/components/landing/fade-in";
import type { Artist, Product } from "@/lib/types";

interface ArtistHeroProps {
  artist: Artist;
  products: Product[];
}

interface MosaicImage {
  src: string;
  alt: string;
}

const CELL_COUNT = 6;
const FLIP_INTERVAL = 3000;
const TRANSITION_MS = 1500;

function getAllImages(products: Product[]): MosaicImage[] {
  return products
    .filter((p) => p.image_url)
    .map((p) => ({ src: p.image_url!, alt: p.title }));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getInitialGrid(images: MosaicImage[]): MosaicImage[] {
  if (images.length === 0) return [];
  return Array.from({ length: CELL_COUNT }, () => pickRandom(images));
}

/**
 * Self-contained mosaic cell. When `incoming` changes (non-null),
 * it renders the new image at opacity 0, waits a frame, then
 * transitions to opacity 1. After the transition, it calls onDone()
 * so the parent can promote the incoming image to current.
 */
function MosaicCell({
  current,
  incoming,
  onDone,
  priority,
  sizes,
  className,
}: {
  current: MosaicImage;
  incoming: MosaicImage | null;
  onDone: () => void;
  priority: boolean;
  sizes: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!incoming) {
      setShow(false);
      return;
    }
    // Phase 1: render at opacity 0 (this frame)
    setShow(false);
    // Phase 2: next frame, transition to opacity 1
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShow(true));
    });
    // Phase 3: after transition, tell parent to promote
    const timer = setTimeout(onDone, TRANSITION_MS + 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [incoming?.src]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={current.src}
        alt={current.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      {incoming && (
        <Image
          src={incoming.src}
          alt={incoming.alt}
          fill
          sizes={sizes}
          className="absolute inset-0 object-cover"
          style={{
            opacity: show ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
          }}
        />
      )}
    </div>
  );
}

export function ArtistHero({ artist, products }: ArtistHeroProps) {
  const allImages = useMemo(() => getAllImages(products), [products]);
  const initialGrid = useMemo(() => getInitialGrid(allImages), [allImages]);

  const [grid, setGrid] = useState<MosaicImage[]>(initialGrid);
  const [incoming, setIncoming] = useState<(MosaicImage | null)[]>(
    () => new Array(CELL_COUNT).fill(null)
  );

  const allImagesRef = useRef(allImages);
  allImagesRef.current = allImages;

  // Keep grid in sync if products load after mount
  useEffect(() => {
    if (initialGrid.length > 0 && grid.length === 0) {
      setGrid(initialGrid);
    }
  }, [initialGrid, grid.length]);

  // Cycle: pick a random cell every FLIP_INTERVAL and assign it a new image
  useEffect(() => {
    if (allImages.length === 0 || initialGrid.length === 0) return;

    const interval = setInterval(() => {
      const cellIndex = Math.floor(Math.random() * CELL_COUNT);
      const newImage = pickRandom(allImagesRef.current);

      setIncoming((prev) => {
        const copy = [...prev];
        copy[cellIndex] = newImage;
        return copy;
      });
    }, FLIP_INTERVAL);

    return () => clearInterval(interval);
  }, [allImages.length, initialGrid.length]);

  // Called by MosaicCell when its transition finishes
  function promoteCel(cellIndex: number) {
    setGrid((prev) => {
      const copy = [...prev];
      const img = incoming[cellIndex];
      if (img) copy[cellIndex] = img;
      return copy;
    });
    setIncoming((prev) => {
      const copy = [...prev];
      copy[cellIndex] = null;
      return copy;
    });
  }

  const hasImages = grid.length > 0;

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Mosaic background */}
      {hasImages ? (
        <div className="absolute inset-0">
          {/* Desktop mosaic: asymmetric editorial grid */}
          <div className="hidden h-full md:grid md:grid-cols-3 md:grid-rows-2">
            {grid.slice(0, CELL_COUNT).map((img, i) => (
              <MosaicCell
                key={`d-${i}`}
                current={img}
                incoming={incoming[i]}
                onDone={() => promoteCel(i)}
                priority={i < 3}
                sizes="33vw"
                className={i === 0 ? "row-span-2" : ""}
              />
            ))}
          </div>

          {/* Mobile mosaic: 2-column grid */}
          <div className="grid h-full grid-cols-2 grid-rows-3 md:hidden">
            {grid.slice(0, CELL_COUNT).map((img, i) => (
              <MosaicCell
                key={`m-${i}`}
                current={img}
                incoming={incoming[i]}
                onDone={() => promoteCel(i)}
                priority={i < 2}
                sizes="50vw"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content overlay — pinned to bottom */}
      <div className="relative z-10 flex min-h-screen flex-col justify-end">
        <div className="px-8 pb-24 pt-32 md:px-16 lg:px-20">
          <FadeIn delay={100}>
            <p className="label-uppercase text-white/50">Artist</p>
          </FadeIn>

          <FadeIn delay={250}>
            <h1 className="mt-4 text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-white md:text-7xl lg:text-8xl xl:text-9xl">
              {artist.name}
            </h1>
          </FadeIn>

          {artist.bio && (
            <FadeIn delay={400}>
              <p className="mt-6 max-w-lg text-base text-white/60 md:text-lg">
                {artist.bio}
              </p>
            </FadeIn>
          )}

          <FadeIn delay={550}>
            <a
              href="#collection"
              className="mt-10 inline-flex items-center border border-white/30 bg-white/10 px-8 py-4 text-xs font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
            >
              View Collection
            </a>
          </FadeIn>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <FadeIn delay={800}>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-px animate-pulse bg-white/30" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
