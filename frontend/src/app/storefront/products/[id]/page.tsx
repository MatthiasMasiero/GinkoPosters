"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  RefreshCw,
  Truck,
  Package,
  ChevronDown,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useCart } from "@/hooks/use-cart";
import { useArtist } from "@/hooks/use-artist";
import { FadeIn } from "@/components/landing/fade-in";
import { ImageGallery } from "@/components/storefront/image-gallery";
import { SizeSelector } from "@/components/storefront/size-selector";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRegion } from "@/hooks/use-region";
import { getRegionalFreeShippingThreshold } from "@/lib/regional-pricing";

function getGalleryImages(product: Product): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = [];

  if (product.image_url) {
    images.push({ src: product.image_url, alt: product.title });
  }

  if (product.gallery_urls?.length > 0) {
    product.gallery_urls.forEach((url, i) => {
      images.push({
        src: url,
        alt: `${product.title} — view ${i + 1}`,
      });
    });
  }

  return images;
}

function ProductDetails({ description }: { description: string | null }) {
  const { formatPrice, region } = useRegion();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-4 w-4 shrink-0 text-foreground" />
          <span className="text-xs font-bold uppercase tracking-[0.06em]">
            Exchange for free within 30 days
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="h-4 w-4 shrink-0 text-foreground" />
          <span className="text-xs font-bold uppercase tracking-[0.06em]">
            Delivered within 5–10 business days
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Package className="h-4 w-4 shrink-0 text-foreground" />
          <span className="text-xs font-bold uppercase tracking-[0.06em]">
            Free shipping on orders over {formatPrice(getRegionalFreeShippingThreshold(region))}
          </span>
        </div>
      </div>

      {description && (
        <div className="mt-5">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
          >
            See details
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              open ? "mt-3 max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem, items } = useCart();
  const { artist } = useArtist();
  const { getPrice, formatPrice } = useRegion();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const hasArtistItemInCart = product
    ? items.some((item) => item.product.artist_id === product.artist_id && item.product.id !== product.id)
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
    setTimeout(() => setAdded(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24 pt-16">
        <div className="line-loader mx-auto w-24 text-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-4 py-24 pt-16 text-center md:px-12">
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
    <div className="page-enter pt-16">
      {/* Back link */}
      <div className="px-4 pt-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to store
          </Link>
        </div>
      </div>

      {hasArtistItemInCart && (
        <div className="mx-auto mt-6 max-w-7xl px-4 md:px-12">
          <div className="border border-accent-red/20 bg-accent-red/5 px-4 py-3 text-sm">
            <span className="font-bold text-accent-red">15% off</span>
            <span className="ml-1 text-muted-foreground">
              — you have another item from this artist in your cart. Add this
              one for a discount!
            </span>
          </div>
        </div>
      )}

      {/* Main layout: images left, info right (sticky) */}
      <div className="mx-auto mt-8 max-w-7xl px-4 pb-24 md:px-12 md:pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
          {/* Left: scrollable stacked images */}
          <FadeIn direction="up">
            <ImageGallery images={getGalleryImages(product)} />
          </FadeIn>

          {/* Right: sticky product info */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <FadeIn direction="right" delay={100}>
              <h1 className="text-3xl font-extrabold uppercase tracking-tight">
                {product.title}
              </h1>
            </FadeIn>

            {/* Size selector */}
            <FadeIn direction="right" delay={200}>
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
            <FadeIn direction="right" delay={300}>
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
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 transition-colors duration-200"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {quantity >= 10 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Max 10 per order
                  </p>
                )}
              </div>
            </FadeIn>

            {/* Add to cart (desktop only — mobile uses sticky CTA below) */}
            <FadeIn direction="right" delay={400}>
              <div className="hidden md:block">
                <Button
                  className="mt-10 w-full py-6 text-xs font-extrabold uppercase tracking-[0.08em]"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                >
                  {added ? "Added to Cart" : "Add to Cart"}
                </Button>
              </div>
            </FadeIn>

            {/* Product details / shipping info */}
            <FadeIn direction="right" delay={500}>
              <ProductDetails description={product.description} />
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-4 md:hidden">
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          className={`flex w-full items-center justify-center gap-2 py-4 text-sm font-extrabold uppercase tracking-[0.08em] transition-all duration-300 disabled:opacity-40 ${
            added
              ? "bg-accent-red text-white"
              : "bg-foreground text-background"
          }`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Added to Cart
            </>
          ) : selectedVariant ? (
            `Add to Cart — ${formatPrice(getPrice(selectedVariant.size))}`
          ) : (
            "Select a Size"
          )}
        </button>
      </div>
    </div>
  );
}
