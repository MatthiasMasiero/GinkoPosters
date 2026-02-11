import type { Artist, Product } from "@/lib/types";

interface ArtistStoreCardProps {
  artist: Artist;
  products: Product[];
}

export function ArtistStoreCard({ artist, products }: ArtistStoreCardProps) {
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
      {/* Poster images grid */}
      <div
        className="aspect-[4/3] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        {products.length > 0 && (
          <div className="grid h-full w-full grid-cols-2 gap-0.5">
            {products.slice(0, 2).map((product) => (
              <div key={product.id} className="relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs text-white/50">{product.title}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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
