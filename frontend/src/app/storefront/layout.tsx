"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArtistProvider } from "@/contexts/artist-context";
import { CartProvider } from "@/contexts/cart-context";
import { RegionProvider } from "@/contexts/region-context";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { api } from "@/lib/api-client";
import { withRetry } from "@/lib/retry";
import type { Artist } from "@/lib/types";

function StorefrontContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadArtist = useCallback(async () => {
    setLoading(true);
    setError(false);

    // Figure out which artist to load, in priority order, then fetch it with
    // a retry so a single cold-load network hiccup doesn't blank the page.
    const cookies = document.cookie.split(";");
    const cookieValue = (name: string) =>
      cookies
        .find((c) => c.trim().startsWith(`${name}=`))
        ?.split("=")[1]
        ?.trim() || "";

    const artistSlug = searchParams.get("artist"); // dev mode query param
    const cookieSlug = cookieValue("artist_slug"); // primary-domain slug routing
    const storedSlug = sessionStorage.getItem("artist_slug"); // previous session
    const domain = cookieValue("artist_domain"); // custom artist domain

    let resolver: (() => Promise<Artist>) | null = null;
    if (artistSlug) {
      sessionStorage.setItem("artist_slug", artistSlug);
      resolver = () => api.artists.getBySlug(artistSlug);
    } else if (cookieSlug) {
      sessionStorage.setItem("artist_slug", cookieSlug);
      resolver = () => api.artists.getBySlug(cookieSlug);
    } else if (storedSlug) {
      resolver = () => api.artists.getBySlug(storedSlug);
    } else if (domain) {
      resolver = () => api.artists.getByDomain(domain);
    }

    // No artist context at all (e.g. bare /storefront) — this is legitimate,
    // not an error, so render through with no artist.
    if (!resolver) {
      setArtist(null);
      setLoading(false);
      return;
    }

    try {
      setArtist(await withRetry(resolver));
    } catch {
      // Fetch genuinely failed after retries — surface it instead of silently
      // rendering an empty, hero-less page.
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadArtist();
  }, [loadArtist]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="line-loader mx-auto w-24 text-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this store. Please check your connection and try
          again.
        </p>
        <button
          onClick={() => loadArtist()}
          className="border border-foreground px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <ArtistProvider artist={artist}>
      <RegionProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <StorefrontHeader />
            <main className="flex-1">{children}</main>
            <StorefrontFooter />
          </div>
        </CartProvider>
      </RegionProvider>
    </ArtistProvider>
  );
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="line-loader mx-auto w-24 text-foreground" />
        </div>
      }
    >
      <StorefrontContent>{children}</StorefrontContent>
    </Suspense>
  );
}
