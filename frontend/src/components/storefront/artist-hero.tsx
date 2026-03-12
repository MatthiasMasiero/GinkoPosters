"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
const FLIP_INTERVAL = 3500; // ms between flips

function getAllImages(products: Product[]): MosaicImage[] {
  return products
    .filter((p) => p.image_url)
    .map((p) => ({ src: p.image_url!, alt: p.title }));
}

function getInitialGrid(images: MosaicImage[]): MosaicImage[] {
  if (images.length === 0) return [];
  const filled = [...images];
  while (filled.length < CELL_COUNT) {
    filled.push(...images);
  }
  return filled.slice(0, CELL_COUNT);
}

/** A single mosaic cell that crossfades between two images */
function MosaicCell({
  current,
  next,
  flipping,
  priority,
  sizes,
  className,
}: {
  current: MosaicImage;
  next: MosaicImage | null;
  flipping: boolean;
  priority: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Current image (fades out when flipping) */}
      <Image
        src={current.src}
        alt={current.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-opacity duration-[1800ms] ease-in-out"
        style={{ opacity: flipping ? 0 : 1 }}
      />
      {/* Next image (fades in when flipping) */}
      {next && (
        <Image
          src={next.src}
          alt={next.alt}
          fill
          sizes={sizes}
          className="object-cover transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: flipping ? 1 : 0 }}
        />
      )}
    </div>
  );
}

export function ArtistHero({ artist, products }: ArtistHeroProps) {
  const allImages = useMemo(() => getAllImages(products), [products]);
  const initialGrid = useMemo(() => getInitialGrid(allImages), [allImages]);

  const [grid, setGrid] = useState<MosaicImage[]>(initialGrid);
  const [nextImages, setNextImages] = useState<(MosaicImage | null)[]>(
    () => new Array(CELL_COUNT).fill(null)
  );
  const [flippingCell, setFlippingCell] = useState<number | null>(null);

  // Keep grid in sync if products load after mount
  useEffect(() => {
    if (initialGrid.length > 0 && grid.length === 0) {
      setGrid(initialGrid);
    }
  }, [initialGrid, grid.length]);

  const pickRandomImage = useCallback(
    (excludeSrcs: string[]): MosaicImage | null => {
      if (allImages.length <= 1) return null;
      const candidates = allImages.filter(
        (img) => !excludeSrcs.includes(img.src)
      );
      if (candidates.length === 0) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    },
    [allImages]
  );

  useEffect(() => {
    if (allImages.length <= 1 || grid.length === 0) return;

    const interval = setInterval(() => {
      // Pick a random cell to flip
      const cellIndex = Math.floor(Math.random() * CELL_COUNT);
      const currentSrcs = grid.map((g) => g.src);
      const newImage = pickRandomImage(currentSrcs);
      if (!newImage) return;

      // Set the next image and trigger the crossfade
      setNextImages((prev) => {
        const copy = [...prev];
        copy[cellIndex] = newImage;
        return copy;
      });
      setFlippingCell(cellIndex);

      // After the crossfade completes, swap current with next
      setTimeout(() => {
        setGrid((prev) => {
          const copy = [...prev];
          copy[cellIndex] = newImage;
          return copy;
        });
        setNextImages((prev) => {
          const copy = [...prev];
          copy[cellIndex] = null;
          return copy;
        });
        setFlippingCell(null);
      }, 1800);
    }, FLIP_INTERVAL);

    return () => clearInterval(interval);
  }, [allImages, grid, pickRandomImage]);

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
                next={nextImages[i]}
                flipping={flippingCell === i}
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
                next={nextImages[i]}
                flipping={flippingCell === i}
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
