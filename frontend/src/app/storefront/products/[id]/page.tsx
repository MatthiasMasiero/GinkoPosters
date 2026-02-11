"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCart } from "@/hooks/use-cart";
import { SizeSelector } from "@/components/storefront/size-selector";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    api.products
      .get(id)
      .then((p) => {
        setProduct(p);
        const activeVariants = p.variants.filter((v) => v.is_active);
        if (activeVariants.length > 0) {
          setSelectedVariant(activeVariants[0]);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleAddToCart() {
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-24 text-center md:px-12">
        <p className="text-muted-foreground">Product not found.</p>
        <Link
          href="/storefront"
          className="mt-4 inline-flex items-center text-sm text-foreground underline"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/storefront"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Product image */}
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                <span className="text-muted-foreground/50">
                  {product.title}
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-light tracking-tight">
              {product.title}
            </h1>

            {selectedVariant && (
              <p className="mt-2 text-xl">
                {formatCurrency(selectedVariant.price)}
              </p>
            )}

            {product.description && (
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {/* Size selector */}
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider">
                Size
              </h3>
              <SizeSelector
                variants={product.variants}
                selectedId={selectedVariant?.id || null}
                onSelect={setSelectedVariant}
              />
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              className="mt-10"
              size="lg"
              onClick={handleAddToCart}
              disabled={!selectedVariant}
            >
              {added ? "Added to Cart" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
