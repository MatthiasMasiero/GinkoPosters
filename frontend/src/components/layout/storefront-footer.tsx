"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useArtist } from "@/hooks/use-artist";
import { storeSubpath, storeUrl } from "@/lib/store-url";

export function StorefrontFooter() {
  const { artist } = useArtist();
  const pathname = usePathname();
  const isProductPage = storeSubpath(pathname, artist).startsWith("/products/");

  return (
    <footer
      className="text-white"
      style={{ backgroundColor: isProductPage ? "#0d0d0d" : "var(--foreground)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-5 md:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em]">
            {artist?.name || "Store"}
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href={storeUrl(artist)} className="text-xs text-white/60 transition-colors duration-200 hover:text-white">All Products</Link>
            <Link href={storeUrl(artist, "/cart")} className="text-xs text-white/60 transition-colors duration-200 hover:text-white">Cart</Link>
            <Link href={storeUrl(artist, "/support")} className="text-xs text-white/60 transition-colors duration-200 hover:text-white">Support</Link>
            <Link href="/#collection" className="text-xs text-white/60 transition-colors duration-200 hover:text-white">Artists</Link>
            <Link href={storeUrl(artist, "/legal")} className="text-xs text-white/60 transition-colors duration-200 hover:text-white">Legal</Link>
          </nav>
          <span className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} GinkoPosters
          </span>
        </div>
      </div>
    </footer>
  );
}
