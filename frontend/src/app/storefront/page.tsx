"use client";

import { useEffect, useState } from "react";
import { useArtist } from "@/hooks/use-artist";
import { api } from "@/lib/api-client";
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
    <div className="px-6 py-12 md:px-12">
      {/* Artist hero */}
      {artist && (
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-light tracking-tight md:text-5xl">
            {artist.name}
          </h1>
          {artist.bio && (
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {artist.bio}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : (
        <div className="mx-auto max-w-5xl">
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
