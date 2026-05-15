import { NextRequest, NextResponse } from "next/server";

const PRIMARY_DOMAINS = (process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || "localhost")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const SKIP_PREFIXES = ["/_next", "/api", "/favicon.ico", "/admin"];

const RESERVED_TOP_LEVEL = new Set([
  "storefront",
  "robots.txt",
  "sitemap.xml",
  "icon.png",
  "apple-icon.png",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API routes, admin routes
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Detect user country from Vercel geo headers
  const country = request.headers.get("x-vercel-ip-country") || "";

  const hostname = request.headers.get("host") || "";
  const hostWithoutPort = hostname.split(":")[0].toLowerCase();

  // Check if this is the primary domain
  const isPrimary =
    PRIMARY_DOMAINS.includes(hostWithoutPort) ||
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1" ||
    hostWithoutPort.endsWith(".vercel.app");

  if (isPrimary) {
    const firstSegment = pathname.split("/")[1] || "";
    const isReserved =
      firstSegment === "" ||
      RESERVED_TOP_LEVEL.has(firstSegment) ||
      firstSegment.includes(".");

    if (isReserved) {
      const response = NextResponse.next();
      response.cookies.set("user_country", country, {
        path: "/",
        sameSite: "lax",
      });
      return response;
    }

    // Treat first segment as artist slug: /madebygray/... → /storefront/...
    const restPath = pathname.slice(firstSegment.length + 1);
    const url = request.nextUrl.clone();
    url.pathname = `/storefront${restPath}`;
    const response = NextResponse.rewrite(url);
    response.cookies.set("artist_slug", firstSegment, {
      path: "/",
      sameSite: "lax",
    });
    response.cookies.set("user_country", country, {
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  // Artist domain: rewrite to storefront routes
  // The storefront layout will handle fetching artist data by domain

  // Store the artist domain in a cookie for the storefront to use
  const response = NextResponse.rewrite(
    new URL(`/storefront${pathname}`, request.url)
  );
  response.cookies.set("artist_domain", hostWithoutPort, {
    path: "/",
    sameSite: "lax",
  });
  response.cookies.set("user_country", country, {
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|images/|favicon.ico).*)",
  ],
};
