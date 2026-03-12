"use client";

import Image from "next/image";
import { FadeIn } from "@/components/landing/fade-in";
import type { Artist, Product } from "@/lib/types";

interface ArtistHeroProps {
  artist: Artist;
  products: Product[];
}

/**
 * Builds mosaic grid items from product images.
 * Repeats images if fewer than 6 to fill the grid.
 */
function getMosaicImages(products: Product[]) {
  const images = products
    .filter((p) => p.image_url)
    .map((p) => ({ src: p.image_url!, alt: p.title }));

  if (images.length === 0) return [];

  // Fill at least 6 slots for a good mosaic
  const filled = [...images];
  while (filled.length < 6) {
    filled.push(...images);
  }
  return filled.slice(0, 6);
}

export function ArtistHero({ artist, products }: ArtistHeroProps) {
  const mosaicImages = getMosaicImages(products);
  const hasImages = mosaicImages.length > 0;

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Mosaic background */}
      {hasImages ? (
        <div className="absolute inset-0">
          {/* Desktop mosaic: asymmetric editorial grid */}
          <div className="hidden h-full md:grid md:grid-cols-3 md:grid-rows-2">
            {mosaicImages.slice(0, 6).map((img, i) => (
              <div
                key={`d-${i}`}
                className={`relative overflow-hidden ${
                  // Make first image span 2 rows for asymmetry
                  i === 0 ? "row-span-2" : ""
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i < 3}
                  sizes={i === 0 ? "33vw" : "33vw"}
                  className="ken-burns object-cover"
                  style={{
                    animationDelay: `${i * 2}s`,
                    animationDuration: `${18 + i * 2}s`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Mobile mosaic: 2-column grid */}
          <div className="grid h-full grid-cols-2 grid-rows-3 md:hidden">
            {mosaicImages.slice(0, 6).map((img, i) => (
              <div key={`m-${i}`} className="relative overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i < 2}
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
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
