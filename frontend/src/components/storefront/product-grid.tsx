import { FadeIn } from "@/components/landing/fade-in";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No products available yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <FadeIn key={product.id} delay={index * 100}>
          <ProductCard product={product} />
        </FadeIn>
      ))}
    </div>
  );
}
