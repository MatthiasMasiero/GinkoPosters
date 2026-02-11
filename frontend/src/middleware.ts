import { NextRequest, NextResponse } from "next/server";

const PRIMARY_DOMAIN = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || "localhost";

const SKIP_PREFIXES = ["/_next", "/api", "/favicon.ico", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API routes, admin routes
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const hostname = request.headers.get("host") || "";
  const hostWithoutPort = hostname.split(":")[0];

  // Check if this is the primary domain
  const isPrimary =
    hostWithoutPort === PRIMARY_DOMAIN ||
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1";

  if (isPrimary) {
    // Primary domain: serve landing/main pages
    return NextResponse.next();
  }

  // Artist domain: rewrite to storefront routes
  // The storefront layout will handle fetching artist data by domain
  const url = request.nextUrl.clone();

  // Store the artist domain in a cookie for the storefront to use
  const response = NextResponse.rewrite(
    new URL(`/storefront${pathname}`, request.url)
  );
  response.cookies.set("artist_domain", hostWithoutPort, {
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
