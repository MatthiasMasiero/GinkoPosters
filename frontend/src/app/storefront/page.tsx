"use client";

import { useEffect, useState } from "react";
import { useArtist } from "@/hooks/use-artist";
import { api } from "@/lib/api-client";
import { FadeIn } from "@/components/landing/fade-in";
import { ArtistHero } from "@/components/storefront/artist-hero";
import { ProductGrid } from "@/components/storefront/product-grid";
import type { Product } from "@/lib/types";

export default function StorefrontHomePage() {
  const { artist } = useArtist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artist) {
      setLoading(false);
      return;
    }
    api.artists
      .getProducts(artist.id)
      .then((prods) => setProducts(prods.filter((p) => p.is_active)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [artist]);

  return (
    <>
      {/* Artist hero */}
      {artist && (
        <ArtistHero
          artist={artist}
          products={products}
          heroImageUrl={
            artist.slug === "madebygray"
              ? "/images/made-by-gray-hero.jpg"
              : undefined
          }
        />
      )}

      {/* The Collection */}
      <section id="collection" className="px-4 py-8 md:px-12 md:py-12 lg:px-16">
        <FadeIn>
          <div className="mb-6 flex items-baseline justify-between md:mb-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wide md:text-xs md:tracking-[0.2em] md:text-muted-foreground">
              The Collection
            </h2>
            <a href="#collection" className="text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
              View All
            </a>
          </div>
        </FadeIn>

        {loading ? (
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="loading-skeleton">
                  <div className="aspect-[3/4] w-full bg-muted" />
                  <div className="mt-3 h-3.5 w-2/3 bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl">
            <ProductGrid products={products} />
          </div>
        )}
      </section>
    </>
  );
}
