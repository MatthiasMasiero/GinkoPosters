"use client";

import Link from "next/link";
import { useArtist } from "@/hooks/use-artist";

export function StorefrontFooter() {
  const { artist } = useArtist();
  const artistParam = artist?.slug ? `?artist=${artist.slug}` : "";

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand column */}
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.08em]">
              {artist?.name || "Store"}
            </p>
            <p className="mt-3 text-sm text-background/60">
              Curated art prints from independent artists. Gallery-quality,
              produced on demand.
            </p>
          </div>

          {/* Shop links */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-background/40">
              Shop
            </p>
            <nav className="mt-4 flex flex-col gap-3">
              <Link
                href={`/storefront${artistParam}`}
                className="text-sm text-background/60 transition-colors duration-200 hover:text-background"
              >
                All Products
              </Link>
              <Link
                href={`/storefront/cart${artistParam}`}
                className="text-sm text-background/60 transition-colors duration-200 hover:text-background"
              >
                Cart
              </Link>
            </nav>
          </div>

          {/* Info links */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-background/40">
              Info
            </p>
            <nav className="mt-4 flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm text-background/60 transition-colors duration-200 hover:text-background"
              >
                Ginko Posters
              </Link>
              <Link
                href={`/storefront/support${artistParam}`}
                className="text-sm text-background/60 transition-colors duration-200 hover:text-background"
              >
                Support
              </Link>
              <Link
                href="/#collection"
                className="text-sm text-background/60 transition-colors duration-200 hover:text-background"
              >
                Artists
              </Link>
              <a
                href="https://docs.google.com/document/d/1BEaKotWAeQi03d8-qkNUjIHVxx1iiwpzio45HdgprTU/edit?tab=t.0#heading=h.yu14bf21kmbo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/60 transition-colors duration-200 hover:text-background"
              >
                Legal Conditions
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 md:flex-row">
          <span className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} {artist?.name || "Store"}
          </span>
          <span className="text-xs text-background/40">
            Powered by GinkoPosters
          </span>
        </div>
      </div>
    </footer>
  );
}
