"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { ArtistForm } from "@/components/admin/artist-form";
import type { Artist } from "@/lib/types";

export default function AdminArtistEditPage() {
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [artist, setArtist] = useState<Artist | undefined>(undefined);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    api.admin.artists
      .get(id)
      .then(setArtist)
      .catch(() => setArtist(undefined))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-light tracking-tight">
        {isNew ? "Create Artist" : `Edit ${artist?.name || "Artist"}`}
      </h1>
      <ArtistForm artist={artist} />
    </div>
  );
}
