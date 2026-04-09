export function GalleryComingSoon() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-8 border-t border-white/[0.04] bg-[#080808] px-8 py-20 text-center">
      <span
        className="text-[9px] uppercase tracking-[0.4em] text-white/20"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        The Gallery Grows
      </span>

      <h3
        className="text-[clamp(32px,6vw,72px)] font-black uppercase leading-[0.88] tracking-[-0.03em] text-white/[0.06]"
      >
        More Artists
        <br />
        Coming Soon
      </h3>

      {/* Placeholder room slots */}
      <div className="flex gap-3">
        {[2, 3, 4].map((n) => (
          <div
            key={n}
            className="flex h-28 w-20 flex-col items-center justify-center gap-2 border border-dashed border-white/10"
          >
            <span
              className="text-[8px] uppercase tracking-[0.2em] text-white/15"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Room
            </span>
            <span
              className="text-lg font-black text-white/10"
            >
              {String(n).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      <p
        className="max-w-sm text-[13px] leading-relaxed text-white/25"
        style={{ fontFamily: "Arial, sans-serif", fontWeight: 400 }}
      >
        New independent artists join the gallery regularly.
        Each brings their own world — their own room.
      </p>
    </section>
  );
}
