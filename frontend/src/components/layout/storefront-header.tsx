"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { useArtist } from "@/hooks/use-artist";
import { useCart } from "@/hooks/use-cart";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { MobileNavSidebar } from "./mobile-nav-sidebar";

export function StorefrontHeader() {
  const { artist } = useArtist();
  const { itemCount } = useCart();
  const { scrollDirection, isAtTop } = useScrollDirection();
  const pathname = usePathname();

  const artistParam = artist?.slug ? `?artist=${artist.slug}` : "";
  const hidden = scrollDirection === "down" && !isAtTop;
  // Only use transparent/white header on the storefront home page (which has the hero)
  const isHeroPage = pathname === "/storefront";
  const isOverHero = isAtTop && isHeroPage;

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 300ms ease, color 300ms ease, background 300ms ease, backdrop-filter 300ms ease",
        color: isOverHero ? "white" : "var(--foreground)",
        backdropFilter: isOverHero || isAtTop ? "blur(0px)" : "blur(50px)",
        WebkitBackdropFilter: isOverHero || isAtTop ? "blur(0px)" : "blur(50px)",
        background: isOverHero || isAtTop ? "transparent" : "color-mix(in oklch, var(--background) 30%, transparent)",
      }}
    >
      {/* Mobile hamburger */}
      <div className="md:hidden">
        <MobileNavSidebar>
          <button aria-label="Open menu" className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Menu className="h-5 w-5" />
          </button>
        </MobileNavSidebar>
      </div>

      {/* Artist name */}
      <Link
        href={`/storefront${artistParam}`}
        className="text-sm font-extrabold uppercase tracking-[0.08em]"
      >
        {artist?.name || "Store"}
      </Link>

      {/* Desktop nav — links inherit the header's smoothly-transitioning color */}
      <nav className="hidden items-center gap-6 md:flex">
        <Link
          href="/"
          className="group relative text-xs font-extrabold uppercase tracking-[0.08em] opacity-70 transition-opacity duration-200 hover:opacity-100"
        >
          <span className="transition-opacity duration-200 group-hover:opacity-0">
            GinkoPosters
          </span>
          <span className="absolute inset-0 italic opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            GinkoPosters
          </span>
        </Link>
        <Link
          href={`/storefront${artistParam}`}
          className="group relative text-xs font-extrabold uppercase tracking-[0.08em] opacity-70 transition-opacity duration-200 hover:opacity-100"
        >
          <span className="transition-opacity duration-200 group-hover:opacity-0">
            Shop
          </span>
          <span className="absolute inset-0 italic opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Shop
          </span>
        </Link>
        <Link
          href={`/storefront/support${artistParam}`}
          className="group relative text-xs font-extrabold uppercase tracking-[0.08em] opacity-70 transition-opacity duration-200 hover:opacity-100"
        >
          <span className="transition-opacity duration-200 group-hover:opacity-0">
            Support
          </span>
          <span className="absolute inset-0 italic opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Support
          </span>
        </Link>
        <Link
          href={`/storefront/cart${artistParam}`}
          aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          className="relative opacity-70 transition-opacity duration-200 hover:opacity-100"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Mobile cart */}
      <Link
        href={`/storefront/cart${artistParam}`}
        aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        className="relative flex min-h-[44px] min-w-[44px] items-center justify-center md:hidden"
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute right-0.5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
            {itemCount}
          </span>
        )}
      </Link>
    </header>
  );
}
