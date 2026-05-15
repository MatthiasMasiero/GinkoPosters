import type { Artist } from "@/lib/types";

// Build a URL into the storefront. When an artist is loaded, uses the clean
// /{slug}/... pattern; otherwise falls back to /storefront/... (used by the
// dev "?artist=" workflow and direct internal access).
export function storeUrl(
  artist: Artist | null | undefined,
  subpath: string = "",
): string {
  if (artist?.slug) {
    return `/${artist.slug}${subpath}`;
  }
  return `/storefront${subpath}`;
}

// Strip the artist-slug or /storefront prefix and return the path within the
// storefront, so pathname checks work for both /{slug}/cart and /storefront/cart.
export function storeSubpath(
  pathname: string,
  artist: Artist | null | undefined,
): string {
  if (pathname === "/storefront") return "";
  if (pathname.startsWith("/storefront/")) {
    return pathname.slice("/storefront".length);
  }
  if (artist?.slug) {
    const slugPrefix = `/${artist.slug}`;
    if (pathname === slugPrefix) return "";
    if (pathname.startsWith(`${slugPrefix}/`)) {
      return pathname.slice(slugPrefix.length);
    }
  }
  return pathname;
}
