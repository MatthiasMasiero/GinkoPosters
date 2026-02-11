"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Artist } from "@/lib/types";

interface ArtistContextValue {
  artist: Artist | null;
}

const ArtistContext = createContext<ArtistContextValue>({ artist: null });

export function ArtistProvider({
  artist,
  children,
}: {
  artist: Artist | null;
  children: ReactNode;
}) {
  return (
    <ArtistContext.Provider value={{ artist }}>
      {children}
    </ArtistContext.Provider>
  );
}

export function useArtist() {
  const context = useContext(ArtistContext);
  return context;
}
