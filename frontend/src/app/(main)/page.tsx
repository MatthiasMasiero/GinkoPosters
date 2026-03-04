"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FadeIn } from "@/components/landing/fade-in";
import { HeroSection } from "@/components/landing/hero-section";
import { PosterCard } from "@/components/landing/poster-card";
import { api } from "@/lib/api-client";
import type { Artist, Product } from "@/lib/types";

const FALLBACK_POSTERS = [
  { src: "/posters/matthias/new-york.avif", title: "New York", alt: "New York poster" },
  { src: "/posters/sean/surf.jpeg", title: "Surf", alt: "Surf poster" },
  { src: "/posters/matthias/rio-brasil.jpg", title: "Rio Brasil", alt: "Rio Brasil poster" },
  { src: "/posters/sean/surf-van.jpg", title: "Surf Van", alt: "Surf van poster" },
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
      <section id="collection" className="px-6 py-24 md:px-16 md:py-32">
        <FadeIn>
          <h2 className="mb-20 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground md:text-sm">
            The Collection
          </h2>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="line-loader mx-auto w-24 text-foreground" />
          </div>
        ) : hasData ? (
          <div className="mx-auto max-w-7xl">
            {activeArtists.map((artist, artistIndex) => {
              const products = artistProducts[artist.id] || [];

              return (
                <div key={artist.id}>
                  {artistIndex > 0 && (
                    <FadeIn>
                      <div className="mx-auto my-24 h-px w-full bg-border" />
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
                  {artist.bio && (
                    <FadeIn delay={100}>
                      <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                        {artist.bio}
                      </p>
                    </FadeIn>
                  )}

                  {/* Poster grid */}
                  <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                    {products.map((product, productIndex) => (
                      <FadeIn key={product.id} delay={productIndex * 100}>
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
            </FadeIn>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {FALLBACK_POSTERS.map((poster, i) => (
                <FadeIn key={poster.src} delay={i * 100}>
                  <div className="group block">
                    <div className="relative aspect-[3/4] w-full overflow-hidden border border-transparent bg-muted transition-all duration-500 hover:border-foreground/20">
                      <Image
                        src={poster.src}
                        alt={poster.alt}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="mt-3 text-sm font-bold uppercase tracking-[0.02em]">
                      {poster.title}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-10 text-center md:py-12">
        <FadeIn>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground md:text-xl">
            Every print is produced on demand with premium materials and
            shipped directly to your door.
          </p>
        </FadeIn>
        <FadeIn delay={150}>
          <a
            href="#collection"
            className="mt-8 inline-flex items-center bg-foreground px-8 py-4 text-xs font-extrabold uppercase tracking-[0.08em] text-background transition-opacity duration-200 hover:opacity-80"
          >
            Start Collecting
          </a>
        </FadeIn>
      </section>
    </>
  );
}
