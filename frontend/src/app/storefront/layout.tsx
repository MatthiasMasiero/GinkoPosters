"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArtistProvider } from "@/contexts/artist-context";
import { CartProvider } from "@/contexts/cart-context";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { api } from "@/lib/api-client";
import type { Artist } from "@/lib/types";

function StorefrontContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtist() {
      try {
        // In dev mode, check for artist query param
        const artistSlug = searchParams.get("artist");
        if (artistSlug) {
          sessionStorage.setItem("artist_slug", artistSlug);
          const a = await api.artists.getBySlug(artistSlug);
          setArtist(a);
          return;
        }

        // Fallback: check sessionStorage for previously loaded artist slug
        const storedSlug = sessionStorage.getItem("artist_slug");
        if (storedSlug) {
          const a = await api.artists.getBySlug(storedSlug);
          setArtist(a);
          return;
        }

        // Try reading from cookie (set by middleware for custom domains)
        const cookies = document.cookie.split(";");
        const domainCookie = cookies.find((c) =>
          c.trim().startsWith("artist_domain=")
        );
        if (domainCookie) {
          const domain = domainCookie.split("=")[1]?.trim();
          if (domain) {
            const a = await api.artists.getByDomain(domain);
            setArtist(a);
            return;
          }
        }
      } catch {
        // Artist not found
      } finally {
        setLoading(false);
      }
    }
    loadArtist();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <ArtistProvider artist={artist}>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <StorefrontHeader />
          <main className="flex-1">{children}</main>
          <StorefrontFooter />
        </div>
      </CartProvider>
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
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <StorefrontContent>{children}</StorefrontContent>
    </Suspense>
  );
}
