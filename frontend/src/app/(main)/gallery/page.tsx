"use client";

import { useEffect, useState, useRef } from "react";
import { GalleryEntry } from "@/components/landing/gallery-entry";
import { ArtistRoom } from "@/components/landing/artist-room";
import { GalleryComingSoon } from "@/components/landing/gallery-coming-soon";
import { api } from "@/lib/api-client";
import type { Artist, Product } from "@/lib/types";

export default function GalleryPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistProducts, setArtistProducts] = useState<Record<string, Product[]>>({});
  const [phase, setPhase] = useState<"lobby" | "exiting" | "room">("lobby");
  const roomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const all = await api.artists.list();
        const active = all.filter((a) => a.is_active);
        setArtists(active);

        const map: Record<string, Product[]> = {};
        await Promise.all(
          active.map(async (artist) => {
            try {
              const prods = await api.artists.getProducts(artist.id);
              map[artist.id] = prods.filter((p) => p.is_active);
            } catch {
              map[artist.id] = [];
            }
          })
        );
        setArtistProducts(map);
      } catch {
        setArtists([]);
      }
    }
    load();
  }, []);

  function handleEnter() {
    // Phase 1: fly-out the lobby
    setPhase("exiting");
    // Phase 2: after fly-out finishes (800ms), show the room with fly-in
    setTimeout(() => {
      setPhase("room");
      // Scroll to room smoothly
      setTimeout(() => {
        roomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }, 800);
  }

  return (
    <div className="bg-black">
      {/* Lobby — hidden once in room phase */}
      {phase !== "room" && (
        <GalleryEntry onEnter={handleEnter} exiting={phase === "exiting"} />
      )}

      {/* Artist rooms */}
      <div ref={roomRef}>
        {artists.map((artist, i) => (
          <ArtistRoom
            key={artist.id}
            artist={artist}
            products={artistProducts[artist.id] || []}
            roomNumber={i + 1}
            visible={phase === "room"}
          />
        ))}
      </div>

      {/* Coming soon — only shown in room phase */}
      {phase === "room" && <GalleryComingSoon />}

      {/* Trust bar */}
      {phase === "room" && (
        <div className="grid grid-cols-3 border-t border-white/[0.06] bg-white text-black">
          {[
            { stat: "200gsm+", label: "Premium Matte Paper" },
            { stat: "2–4",     label: "Day Dispatch" },
            { stat: "∞",       label: "Ships Worldwide" },
          ].map(({ stat, label }) => (
            <div key={label} className="flex flex-col items-center py-10 text-center">
              <span className="text-4xl font-black tracking-tight">{stat}</span>
              <span
                className="mt-1 text-[9px] uppercase tracking-[0.25em] text-neutral-500"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
