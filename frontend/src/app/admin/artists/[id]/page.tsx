"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { ArtistForm } from "@/components/admin/artist-form";
import { Button } from "@/components/ui/button";
import type { Artist } from "@/lib/types";

export default function AdminArtistEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [artist, setArtist] = useState<Artist | undefined>(undefined);
  const [loading, setLoading] = useState(!isNew);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api.admin.artists
      .get(id)
      .then(setArtist)
      .catch(() => setArtist(undefined))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function cancelDelete() {
    setDeleteConfirmStep(0);
  }

  async function handleDelete() {
    if (deleteConfirmStep === 0) {
      setDeleteConfirmStep(1);
      return;
    }
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2);
      return;
    }
    setDeleting(true);
    try {
      await api.admin.artists.delete(id);
      router.push("/admin/artists");
    } catch {
      setDeleteConfirmStep(0);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight">
          {isNew ? "Create Artist" : `Edit ${artist?.name || "Artist"}`}
        </h1>
      </div>
      <ArtistForm artist={artist} />

      {/* Delete section on edit page */}
      {!isNew && artist && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete this artist and all associated data.
          </p>

          {/* Delete confirmation modal */}
          {deleteConfirmStep > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="mx-4 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
                {deleteConfirmStep === 1 ? (
                  <>
                    <h2 className="text-lg font-semibold">Delete Artist</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Are you sure you want to delete <strong>{artist.name}</strong>? This will
                      also remove all their products and orders.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                      <Button variant="outline" onClick={cancelDelete}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
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
                      This action is <strong>permanent and cannot be undone</strong>. All data
                      for <strong>{artist.name}</strong> will be permanently deleted.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                      <Button variant="outline" onClick={cancelDelete}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "I understand, delete permanently"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <Button variant="destructive" onClick={handleDelete}>
              Delete Artist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
