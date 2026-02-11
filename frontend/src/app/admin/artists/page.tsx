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
import type { Artist } from "@/lib/types";

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.artists
      .list()
      .then(setArtists)
      .catch(() => setArtists([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight">Artists</h1>
        <Link href="/admin/artists/new">
          <Button>Create Artist</Button>
        </Link>
      </div>

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
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
                      {(artist.commission_rate * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={artist.is_active ? "default" : "secondary"}
                      >
                        {artist.is_active ? "Active" : "Inactive"}
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
