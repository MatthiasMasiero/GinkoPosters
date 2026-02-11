"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { ArtistStoreCard } from "@/components/landing/artist-store-card";
import { api } from "@/lib/api-client";
import type { Artist } from "@/lib/types";

export default function LandingPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.artists
      .list()
      .then(setArtists)
      .catch(() => {
        // API may not be available during development
        setArtists([]);
      })
      .finally(() => setLoading(false));
  }, []);

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
        ) : artists.length > 0 ? (
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {artists
              .filter((a) => a.is_active)
              .map((artist) => (
                <ArtistStoreCard key={artist.id} artist={artist} />
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
