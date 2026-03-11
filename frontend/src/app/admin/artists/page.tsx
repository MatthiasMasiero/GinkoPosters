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
import type { Artist } from "@/lib/types";

export default function AdminArtistsPage() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.admin.artists
      .list()
      .then(setArtists)
      .catch(() => setArtists([]))
      .finally(() => setLoading(false));
  }, []);

  function startDelete(artist: Artist) {
    setDeleteTarget(artist);
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
      await api.admin.artists.delete(deleteTarget.id);
      setArtists((prev) => prev.filter((a) => a.id !== deleteTarget.id));
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
        <h1 className="text-2xl font-light tracking-tight">Artists</h1>
        <Link href="/admin/artists/new">
          <Button>Create Artist</Button>
        </Link>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            {deleteConfirmStep === 1 ? (
              <>
                <h2 className="text-lg font-semibold">Delete Artist</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This will
                  also remove all their products and orders.
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
                  <strong>{deleteTarget.name}</strong> will be permanently deleted.
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

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No artists found.
                  </TableCell>
                </TableRow>
              ) : (
                artists.map((artist) => (
                  <TableRow key={artist.id}>
                    <TableCell>
                      <Link
                        href={`/admin/artists/${artist.id}`}
                        className="font-medium hover:underline"
                      >
                        {artist.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {artist.domain}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div
                        className="inline-block h-4 w-4 rounded-full border"
                        style={{ backgroundColor: artist.primary_color }}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={artist.is_active ? "default" : "secondary"}
                      >
                        {artist.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/artists/${artist.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => startDelete(artist)}
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
