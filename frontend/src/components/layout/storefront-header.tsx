"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useArtist } from "@/hooks/use-artist";
import { useCart } from "@/hooks/use-cart";

export function StorefrontHeader() {
  const { artist } = useArtist();
  const { itemCount } = useCart();

  const accentColor = artist?.primary_color || "#18181b";
  const artistParam = artist?.slug ? `?artist=${artist.slug}` : "";

  return (
    <header className="flex items-center justify-between border-b px-6 py-5 md:px-12">
      <Link
        href={`/storefront${artistParam}`}
        className="text-lg font-medium tracking-tight"
        style={{ color: accentColor }}
      >
        {artist?.name || "Store"}
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          GinkoPosters
        </Link>
        <Link
          href={`/storefront${artistParam}`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        <Link
          href={`/storefront/cart${artistParam}`}
          className="relative text-muted-foreground transition-colors hover:text-foreground"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span
              className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              {itemCount}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}
