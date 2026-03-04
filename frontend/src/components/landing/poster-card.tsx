import Image from "next/image";
import type { Product } from "@/lib/types";

interface PosterCardProps {
  product: Product;
  artistSlug: string;
}

export function PosterCard({ product, artistSlug }: PosterCardProps) {
  const href = `/storefront/products/${product.id}?artist=${artistSlug}`;

  return (
    <a href={href} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-transparent bg-muted transition-all duration-500 hover:border-foreground/20">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground/50">
              {product.title}
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm font-bold uppercase tracking-[0.02em]">
        {product.title}
      </p>
    </a>
  );
}
