"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { ArtistStoreCard } from "@/components/landing/artist-store-card";
import { api } from "@/lib/api-client";
import type { Artist, Product } from "@/lib/types";

export default function LandingPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistProducts, setArtistProducts] = useState<Record<string, Product[]>>({});
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

  return (
    <>
      <HeroSection />

      <section id="artists" className="px-6 pb-24 md:px-12">
        <h2 className="mb-12 text-center text-2xl font-light tracking-tight md:text-3xl">
          Featured Artists
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        ) : activeArtists.length > 0 ? (
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
            {activeArtists.map((artist) => (
              <ArtistStoreCard
                key={artist.id}
                artist={artist}
                products={artistProducts[artist.id] || []}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No artists available yet. Check back soon.
          </p>
        )}
      </section>
    </>
  );
}
