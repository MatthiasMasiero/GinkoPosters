"use client";

import { useArtist } from "@/hooks/use-artist";

export function StorefrontFooter() {
  const { artist } = useArtist();

  return (
    <footer className="border-t px-6 py-8 md:px-12">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <span className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {artist?.name || "Store"}
        </span>
        <span className="text-xs text-muted-foreground/60">
          Powered by GinkoPosters
        </span>
      </div>
    </footer>
  );
}
