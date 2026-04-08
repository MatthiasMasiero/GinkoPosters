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
      <section id="collection">
        <FadeIn>
          <div className="mb-6 flex items-baseline justify-between px-4 pt-8 md:mb-8 md:px-12 md:pt-12 lg:px-16">
            <h2 className="text-sm font-extrabold uppercase tracking-wide md:text-xs md:tracking-[0.2em] md:text-muted-foreground">
              The Collection
            </h2>
            <a href="#collection" className="text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
              View All
            </a>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] w-full bg-muted" />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </>
  );
}
