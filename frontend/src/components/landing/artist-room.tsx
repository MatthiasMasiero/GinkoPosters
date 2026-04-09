import Image from "next/image";
import type { Artist, Product } from "@/lib/types";

interface ArtistRoomProps {
  artist: Artist;
  products: Product[];
  roomNumber: number;
  visible: boolean;
}

export function ArtistRoom({ artist, products, roomNumber, visible }: ArtistRoomProps) {
  const storeHref = `/storefront?artist=${artist.slug}`;

  // Pick up to 3 products with images for the wall mosaic
  const wallPosters = products
    .filter((p) => p.image_url)
    .slice(0, 3);

  const padded = String(roomNumber).padStart(2, "0");

  return (
    <section
      className={`relative min-h-screen bg-[#0d0d0d] transition-all grid grid-cols-1 lg:grid-cols-2 ${
        visible ? "animate-fly-in" : "opacity-0 pointer-events-none"
      }`}
      style={{ display: visible ? undefined : "none" }}
    >
      {/* Left: artist info */}
      <div className="flex flex-col justify-center px-8 py-20 md:px-12 lg:px-24">
        <span
          className="text-[9px] uppercase tracking-[0.35em] text-white/25"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Room {padded}
        </span>

        {/* Giant ghost number */}
        <div
          className="pointer-events-none select-none text-[160px] font-black leading-none tracking-[-0.05em] text-white/[0.03]"
        >
          {padded}
        </div>

        <h2
          className="relative z-10 -mt-8 text-[clamp(40px,6vw,80px)] font-black uppercase leading-[0.85] tracking-[-0.03em] text-white"
        >
          {artist.name}
        </h2>

        {artist.bio && (
          <p
            className="mt-6 max-w-sm text-sm leading-relaxed text-white/40"
            style={{ fontFamily: "Arial, sans-serif", fontWeight: 400 }}
          >
            {artist.bio}
          </p>
        )}

        <a
          href={storeHref}
          className="mt-10 inline-block w-fit bg-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-80"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Enter Store →
        </a>
      </div>

      {/* Right: poster mosaic wall */}
      <div className="relative min-h-[50vh] overflow-hidden border-t border-white/[0.04] lg:border-t-0 lg:border-l">
        {wallPosters.length > 0 ? (
          <div
            className="absolute inset-0 grid gap-[3px] p-10"
            style={{
              gridTemplateColumns: "2fr 1fr",
              gridTemplateRows: "1fr 1fr",
            }}
          >
            {wallPosters[0] && (
              <div className="relative overflow-hidden" style={{ gridRow: "1 / 3" }}>
                <Image
                  src={wallPosters[0].image_url!}
                  alt={wallPosters[0].title}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            )}
            {wallPosters[1] && (
              <div className="relative overflow-hidden">
                <Image
                  src={wallPosters[1].image_url!}
                  alt={wallPosters[1].title}
                  fill
                  sizes="15vw"
                  className="object-cover"
                />
              </div>
            )}
            {wallPosters[2] && (
              <div className="relative overflow-hidden">
                <Image
                  src={wallPosters[2].image_url!}
                  alt={wallPosters[2].title}
                  fill
                  sizes="15vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-white/10">
              No posters yet
            </span>
          </div>
        )}

        {/* Vignette overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Back to lobby */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute left-6 top-6 text-[9px] uppercase tracking-[0.3em] text-white/20 transition-colors hover:text-white/60"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        ← Lobby
      </button>
    </section>
  );
}
