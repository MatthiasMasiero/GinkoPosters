"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArtistProvider } from "@/contexts/artist-context";
import { CartProvider } from "@/contexts/cart-context";
import { RegionProvider } from "@/contexts/region-context";
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

        // Slug routing on primary domain: middleware sets artist_slug cookie
        // for paths like ginkoposters.com/madebygray
        const cookies = document.cookie.split(";");
        const slugCookie = cookies.find((c) =>
          c.trim().startsWith("artist_slug=")
        );
        if (slugCookie) {
          const slug = slugCookie.split("=")[1]?.trim();
          if (slug) {
            sessionStorage.setItem("artist_slug", slug);
            const a = await api.artists.getBySlug(slug);
            setArtist(a);
            return;
          }
        }

        // Fallback: check sessionStorage for previously loaded artist slug
        const storedSlug = sessionStorage.getItem("artist_slug");
        if (storedSlug) {
          const a = await api.artists.getBySlug(storedSlug);
          setArtist(a);
          return;
        }

        // Custom artist domain (e.g. madebygray.com): middleware sets artist_domain
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
        <div className="line-loader mx-auto w-24 text-foreground" />
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
