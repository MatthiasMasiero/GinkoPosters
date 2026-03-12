"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { GalleryUpload } from "@/components/admin/gallery-upload";
import { api } from "@/lib/api-client";
import type { Artist, Product } from "@/lib/types";

interface VariantRow {
  size: string;
  sku: string;
  price: string;
  cost_price: string;
}

const SIZES = ["A4", "A3", "A2", "A1"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [artists, setArtists] = useState<Artist[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [artistId, setArtistId] = useState(product?.artist_id || "");
  const [title, setTitle] = useState(product?.title || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(product?.gallery_urls || []);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [slugEdited, setSlugEdited] = useState(false);

  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      size: v.size,
      sku: v.sku,
      price: String(v.price),
      cost_price: String(v.cost_price),
    })) || [{ size: "A3", sku: "", price: "", cost_price: "" }]
  );

  useEffect(() => {
    api.admin.artists.list().then(setArtists).catch(() => setArtists([]));
  }, []);

  useEffect(() => {
    if (!slugEdited && !isEdit) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited, isEdit]);

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { size: "A3", sku: "", price: "", cost_price: "" },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof VariantRow, value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!artistId) {
      setError("Please select an artist.");
      return;
    }

    if (variants.length === 0) {
      setError("At least one variant is required.");
      return;
    }

    if (variants.some((v) => !v.sku || !v.price || !v.cost_price)) {
      setError("All variant fields (SKU, price, cost price) are required.");
      return;
    }

    setSubmitting(true);

    const parsedVariants = variants.map((v) => ({
      size: v.size,
      sku: v.sku,
      price: parseFloat(v.price),
      cost_price: parseFloat(v.cost_price),
    }));

    try {
      if (isEdit) {
        await api.admin.products.update(product.id, {
          title,
          slug,
          description: description || null,
          image_url: imageUrl || null,
          gallery_urls: galleryUrls,
          is_active: isActive,
          variants: parsedVariants,
        });
      } else {
        await api.admin.products.create({
          artist_id: artistId,
          title,
          slug,
          description: description || null,
          image_url: imageUrl || null,
          gallery_urls: galleryUrls,
          variants: parsedVariants,
        });
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedArtist = artists.find((a) => a.id === artistId);

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <Label>Artist *</Label>
        <Select
          value={artistId}
          onValueChange={setArtistId}
          disabled={isEdit}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select an artist" />
          </SelectTrigger>
          <SelectContent>
            {artists.map((artist) => (
              <SelectItem key={artist.id} value={artist.id}>
                {artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          required
          pattern="^[a-z0-9\-]+$"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Poster Image</Label>
        <div className="mt-1">
          <ImageUpload
            folder={`posters/${selectedArtist?.slug || "unknown"}`}
            currentUrl={imageUrl}
            onUpload={setImageUrl}
          />
        </div>
      </div>

      <div>
        <Label>Gallery Images</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          Additional images (mockups, room views) that customers can flip through. Large images are auto-compressed.
        </p>
        <GalleryUpload
          urls={galleryUrls}
          onChange={setGalleryUrls}
          folder={`posters/${selectedArtist?.slug || "unknown"}`}
        />
      </div>

      {isEdit && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-input"
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      )}

      {/* Variants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Variants *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="mr-1 h-3 w-3" />
            Add Variant
          </Button>
        </div>

        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex items-end gap-3 rounded-md border p-3"
          >
            <div className="w-24">
              <Label className="text-xs">Size</Label>
              <Select
                value={variant.size}
                onValueChange={(val) => updateVariant(index, "size", val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs">SKU</Label>
              <Input
                value={variant.sku}
                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-28">
              <Label className="text-xs">Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={variant.price}
                onChange={(e) => updateVariant(index, "price", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-28">
              <Label className="text-xs">Cost Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={variant.cost_price}
                onChange={(e) =>
                  updateVariant(index, "cost_price", e.target.value)
                }
                className="mt-1"
              />
            </div>
            {variants.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : isEdit
              ? "Update Product"
              : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
