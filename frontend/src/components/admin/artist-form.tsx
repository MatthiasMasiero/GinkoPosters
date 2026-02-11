"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import type { Artist } from "@/lib/types";

interface ArtistFormProps {
  artist?: Artist;
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!artist;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: Partial<Artist> = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      domain: formData.get("domain") as string,
      bio: (formData.get("bio") as string) || null,
      primary_color: (formData.get("primary_color") as string) || "#000000",
      secondary_color: (formData.get("secondary_color") as string) || "#FFFFFF",
      logo_url: (formData.get("logo_url") as string) || null,
      is_active: formData.get("is_active") === "on",
    };

    try {
      if (isEdit && artist) {
        await api.admin.artists.update(artist.id, data);
      } else {
        await api.admin.artists.create(data);
      }
      router.push("/admin/artists");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save artist");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" defaultValue={artist?.name} required className="mt-1" />
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" name="slug" defaultValue={artist?.slug} required className="mt-1" />
      </div>

      <div>
        <Label htmlFor="domain">Domain *</Label>
        <Input
          id="domain"
          name="domain"
          defaultValue={artist?.domain}
          placeholder="artist.example.com"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={artist?.bio || ""} rows={3} className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary_color">Primary Color</Label>
          <Input
            id="primary_color"
            name="primary_color"
            type="color"
            defaultValue={artist?.primary_color || "#18181b"}
            className="mt-1 h-10"
          />
        </div>
        <div>
          <Label htmlFor="secondary_color">Secondary Color</Label>
          <Input
            id="secondary_color"
            name="secondary_color"
            type="color"
            defaultValue={artist?.secondary_color || "#a1a1aa"}
            className="mt-1 h-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input
          id="logo_url"
          name="logo_url"
          defaultValue={artist?.logo_url || ""}
          placeholder="https://..."
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          defaultChecked={artist?.is_active ?? true}
          className="rounded border-input"
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Update Artist" : "Create Artist"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
