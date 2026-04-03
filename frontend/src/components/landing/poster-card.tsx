import Image from "next/image";
import type { Product } from "@/lib/types";

interface PosterCardProps {
  product: Product;
  artistSlug: string;
  artistName: string;
}

export function PosterCard({ product, artistSlug, artistName }: PosterCardProps) {
  const artistHref = `/storefront?artist=${artistSlug}`;

  return (
    <div className="group">
      <a href={artistHref} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted transition-shadow duration-500 group-hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground/50">
                {product.title}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      </a>
      <p className="mt-3 text-sm font-bold uppercase tracking-[0.02em] transition-colors duration-300 group-hover:text-foreground/70">
        {product.title}
      </p>
      <a
        href={artistHref}
        className="mt-1 block text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        {artistName}
      </a>
    </div>
  );
}
