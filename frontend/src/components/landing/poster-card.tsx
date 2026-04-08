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
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted transition-shadow duration-300 group-hover:shadow-lg">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted px-4 text-center">
              <span className="text-base font-medium text-muted-foreground">
                {product.title}
              </span>
              <span className="text-xs text-muted-foreground/50">No image available</span>
            </div>
          )}
        </div>
        <div className="mt-2 space-y-0.5">
          <p className="text-sm font-medium leading-tight">{product.title}</p>
          <p className="text-xs text-muted-foreground">{artistName}</p>
        </div>
      </a>
    </div>
  );
}
