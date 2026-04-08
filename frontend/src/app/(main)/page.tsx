"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FadeIn } from "@/components/landing/fade-in";
import { HeroSection } from "@/components/landing/hero-section";
import { PosterCard } from "@/components/landing/poster-card";
import { api } from "@/lib/api-client";
import type { Artist, Product } from "@/lib/types";

function SkeletonCard() {
  return (
    <div>
      <div className="loading-skeleton aspect-[3/4] w-full bg-muted" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

const FALLBACK_POSTERS = [
  { src: "/images/madebygray/travis-scott.jpg", title: "Travis Scott", alt: "Travis Scott poster" },
  { src: "/images/madebygray/jordan-barrett.jpg", title: "Jordan Barrett", alt: "Jordan Barrett poster" },
  { src: "/images/madebygray/bape-x-kidsuper.jpg", title: "Bape x KidSuper", alt: "Bape x KidSuper poster" },
  { src: "/images/madebygray/yohji-yamamoto-aw1998.jpg", title: "Yohji Yamamoto AW1998", alt: "Yohji Yamamoto AW1998 poster" },
];

export default function LandingPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistProducts, setArtistProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allArtists = await api.artists.list();
        setArtists(allArtists);

        const productsMap: Record<string, Product[]> = {};
        await Promise.all(
          allArtists
            .filter((a) => a.is_active)
            .map(async (artist) => {
              try {
                const products = await api.artists.getProducts(artist.id);
                productsMap[artist.id] = products.filter((p) => p.is_active);
              } catch {
                productsMap[artist.id] = [];
              }
            })
        );
        setArtistProducts(productsMap);
      } catch {
        setArtists([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeArtists = artists.filter((a) => a.is_active);

  const allProducts = Object.values(artistProducts).flat();
  const apiImages = allProducts
    .filter((p) => p.image_url)
    .map((p) => ({ src: p.image_url!, alt: p.title }));
  const posterImages = apiImages.length > 0
    ? apiImages
    : FALLBACK_POSTERS.map((p) => ({ src: p.src, alt: p.alt }));

  const hasData = activeArtists.length > 0;

  return (
    <>
      <HeroSection posters={posterImages} />

      {/* The Collection */}
      <section id="collection" className="px-6 pt-6 pb-10 md:px-12 md:pt-8 md:pb-12 lg:px-16">
        <FadeIn>
          <div className="mb-6 flex items-baseline justify-between md:mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wide md:text-xs md:tracking-[0.2em] md:text-muted-foreground">
              The Collection
            </h2>
            <a href="/storefront" className="text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
              View All
            </a>
          </div>
        </FadeIn>

        {loading ? (
          <div className="mx-auto max-w-7xl">
            <SkeletonGrid />
          </div>
        ) : hasData ? (
          <div className="mx-auto max-w-7xl">
            {activeArtists.map((artist, artistIndex) => {
              const products = artistProducts[artist.id] || [];

              return (
                <div key={artist.id}>
                  {artistIndex > 0 && (
                    <FadeIn>
                      <div className="mx-auto my-14 h-px w-full bg-border md:my-16" />
                    </FadeIn>
                  )}

                  {/* Artist header */}
                  <FadeIn>
                    <div className="flex items-baseline justify-between gap-4">
                      <a href={`/storefront?artist=${artist.slug}`} className="transition-opacity hover:opacity-70">
                        <h3 className="text-3xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                          {artist.name}
                        </h3>
                      </a>
                      <a
                        href={`/storefront?artist=${artist.slug}`}
                        className="shrink-0 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        Visit Store &rarr;
                      </a>
                    </div>
                  </FadeIn>

                  {/* Poster grid */}
                  <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                    {products.map((product, productIndex) => (
                      <FadeIn key={product.id} delay={Math.min(productIndex * 100, 800)}>
                        <PosterCard
                          product={product}
                          artistSlug={artist.slug}
                        />
                      </FadeIn>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback grid when no API data */
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-3xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                  Featured Artists
                </h3>
              </div>
              <a
                href="/storefront?artist=madebygray"
                className="mt-2 inline-block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                MadeByGray
              </a>
            </FadeIn>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {FALLBACK_POSTERS.map((poster, i) => (
                <FadeIn key={poster.src} delay={Math.min(i * 100, 800)}>
                  <div className="group">
                    <a href="/storefront?artist=madebygray" className="block">
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                        <Image
                          src={poster.src}
                          alt={poster.alt}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-10 text-center md:px-12 md:py-12">
        <FadeIn>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground md:text-xl">
            Every print is produced on demand with premium materials and
            shipped directly to your door.
          </p>
        </FadeIn>
        <FadeIn delay={150}>
          <a
            href="/storefront"
            className="mt-8 inline-flex items-center bg-foreground px-8 py-4 text-xs font-extrabold uppercase tracking-[0.08em] text-background transition-opacity duration-200 hover:opacity-80"
          >
            Enter the Store
          </a>
        </FadeIn>
      </section>
    </>
  );
}
