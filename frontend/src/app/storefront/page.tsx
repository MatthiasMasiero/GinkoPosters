"use client";

import { useEffect, useState } from "react";
import { useArtist } from "@/hooks/use-artist";
import { api } from "@/lib/api-client";
import { FadeIn } from "@/components/landing/fade-in";
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
    <div className="page-enter px-6 py-12 md:px-12">
      {/* Artist hero */}
      {artist && (
        <div className="mb-16">
          <FadeIn>
            <h1 className="text-5xl font-extrabold uppercase tracking-tight md:text-7xl">
              {artist.name}
            </h1>
          </FadeIn>
          {artist.bio && (
            <FadeIn delay={100}>
              <p className="mt-4 max-w-xl text-muted-foreground">
                {artist.bio}
              </p>
            </FadeIn>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="line-loader mx-auto w-24 text-foreground" />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl">
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
