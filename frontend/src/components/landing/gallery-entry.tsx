"use client";

interface GalleryEntryProps {
  onEnter: () => void;
  exiting: boolean;
}

export function GalleryEntry({ onEnter, exiting }: GalleryEntryProps) {
  return (
    <section
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black ${
        exiting ? "animate-fly-out pointer-events-none" : ""
      }`}
    >
      {/* Subtle grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Welcome to
        </p>

        <h1
          className="text-[clamp(64px,14vw,160px)] font-black uppercase leading-[0.82] tracking-[-0.04em] text-white"
        >
          Ginko
          <br />
          <span className="text-white/10">Posters</span>
        </h1>

        <p
          className="mt-2 max-w-xs text-sm text-white/30"
          style={{ fontFamily: "Arial, sans-serif", fontWeight: 400 }}
        >
          Independent artists. Premium prints. Your walls.
        </p>

        <button
          onClick={onEnter}
          className="mt-6 border border-white/30 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-black"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Enter the Gallery ↓
        </button>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-white/30 to-transparent" />
        <span
          className="text-[9px] uppercase tracking-[0.3em] text-white/20"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
