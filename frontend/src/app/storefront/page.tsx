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
      <section id="collection" className="px-8 py-24 md:px-16 md:py-32 lg:px-20">
        <FadeIn>
          <h2 className="mb-20 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground md:text-sm">
            The Collection
          </h2>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="line-loader mx-auto w-24 text-foreground" />
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
