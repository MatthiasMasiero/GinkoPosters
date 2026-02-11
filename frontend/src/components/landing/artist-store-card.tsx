import type { Artist } from "@/lib/types";

interface ArtistStoreCardProps {
  artist: Artist;
}

export function ArtistStoreCard({ artist }: ArtistStoreCardProps) {
  const primaryColor = artist.primary_color || "#18181b";
  const secondaryColor = artist.secondary_color || "#a1a1aa";

  // In dev, use query param fallback; in production, use the artist's domain
  const storeUrl =
    process.env.NODE_ENV === "development"
      ? `/storefront?artist=${artist.slug}`
      : `https://${artist.domain}`;

  return (
    <a
      href={storeUrl}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      {/* Gradient placeholder for hero image */}
      <div
        className="aspect-[4/3] w-full"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      />
      <div className="p-6">
        <h3 className="text-lg font-medium tracking-tight">{artist.name}</h3>
        {artist.bio && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {artist.bio}
          </p>
        )}
        <span className="mt-4 inline-flex items-center text-sm font-medium tracking-wide transition-opacity group-hover:opacity-70">
          Visit Store
          <span className="ml-1 transition-transform group-hover:translate-x-1">
            &rarr;
          </span>
        </span>
      </div>
    </a>
  );
}
