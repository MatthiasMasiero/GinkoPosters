"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCart } from "@/hooks/use-cart";
import { useArtist } from "@/hooks/use-artist";
import { FadeIn } from "@/components/landing/fade-in";
import { SizeSelector } from "@/components/storefront/size-selector";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem, items } = useCart();
  const { artist } = useArtist();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Check if user already has an item from this product's artist
  const hasArtistItemInCart = product
    ? items.some((item) => item.product.artist_id === product.artist_id)
    : false;

  const backHref = artist?.slug
    ? `/storefront?artist=${artist.slug}`
    : "/storefront";

  useEffect(() => {
    const id = params.id as string;
    api.products
      .get(id)
      .then((p) => {
        setProduct(p);
        if (p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
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
        <div className="line-loader mx-auto w-24 text-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-24 text-center md:px-12">
        <p className="text-muted-foreground">Product not found.</p>
        <Link
          href={backHref}
          className="mt-4 inline-flex items-center text-sm text-foreground underline"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter px-6 py-12 md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to store
        </Link>

        {hasArtistItemInCart && (
          <div className="mb-8 border border-accent-red/20 bg-accent-red/5 px-4 py-3 text-sm">
            <span className="font-bold text-accent-red">15% off</span>
            <span className="ml-1 text-muted-foreground">
              — you have another item from this artist in your cart. Add this one for a discount!
            </span>
          </div>
        )}

        <div className="grid gap-12 md:grid-cols-2">
          {/* Product image */}
          <FadeIn direction="left">
            <div className="relative aspect-[3/4] overflow-hidden border border-border bg-muted">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground/50">
                    {product.title}
                  </span>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Product info */}
          <div className="flex flex-col">
            <FadeIn direction="right" delay={100}>
              <h1 className="text-3xl font-extrabold uppercase tracking-tight">
                {product.title}
              </h1>

              {selectedVariant && (
                <p className="mt-2 text-xl">
                  {formatCurrency(selectedVariant.price)}
                </p>
              )}
            </FadeIn>

            {product.description && (
              <FadeIn direction="right" delay={200}>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </FadeIn>
            )}

            {/* Size selector */}
            <FadeIn direction="right" delay={300}>
              <div className="mt-8">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em]">
                  Size
                </h3>
                <SizeSelector
                  variants={product.variants}
                  selectedId={selectedVariant?.id || null}
                  onSelect={setSelectedVariant}
                />
              </div>
            </FadeIn>

            {/* Quantity */}
            <FadeIn direction="right" delay={400}>
              <div className="mt-8">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em]">
                  Quantity
                </h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 transition-colors duration-200"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 transition-colors duration-200"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Add to cart */}
            <FadeIn direction="right" delay={500}>
              <Button
                className="mt-10 w-full py-6 text-xs font-extrabold uppercase tracking-[0.08em] md:w-auto md:px-12"
                size="lg"
                onClick={handleAddToCart}
                disabled={!selectedVariant}
              >
                {added ? "Added to Cart" : "Add to Cart"}
              </Button>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
