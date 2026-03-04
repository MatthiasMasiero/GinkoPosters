"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Artist, Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistFilter, setArtistFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.artists
      .list()
      .then(setArtists)
      .catch(() => setArtists([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params =
      artistFilter !== "all" ? { artist_id: artistFilter } : undefined;
    api.admin.products
      .list(params)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [artistFilter]);

  function getArtistName(artistId: string) {
    return artists.find((a) => a.id === artistId)?.name || "Unknown";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight">Products</h1>
        <Link href="/admin/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      <div className="mt-4">
        <Select value={artistFilter} onValueChange={setArtistFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by artist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Artists</SelectItem>
            {artists.map((artist) => (
              <SelectItem key={artist.id} value={artist.id}>
                {artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getArtistName(product.artist_id)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.variants.length}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_active ? "default" : "secondary"}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
