"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistFilter, setArtistFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [deleting, setDeleting] = useState(false);

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

  function startDelete(product: Product) {
    setDeleteTarget(product);
    setDeleteConfirmStep(1);
  }

  function cancelDelete() {
    setDeleteTarget(null);
    setDeleteConfirmStep(0);
  }

  async function confirmDelete() {
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2);
      return;
    }
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.products.delete(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      cancelDelete();
    } catch {
      cancelDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight">Products</h1>
        <Link href="/admin/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            {deleteConfirmStep === 1 ? (
              <>
                <h2 className="text-lg font-semibold">Delete Product</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This will
                  remove all variants and order history for this product.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={cancelDelete}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Yes, delete
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-destructive">
                  Final Confirmation
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This action is <strong>permanent and cannot be undone</strong>. All data for{" "}
                  <strong>{deleteTarget.title}</strong> will be permanently deleted.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={cancelDelete}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "I understand, delete permanently"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/products/${product.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => startDelete(product)}
                        >
                          Delete
                        </Button>
                      </div>
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
