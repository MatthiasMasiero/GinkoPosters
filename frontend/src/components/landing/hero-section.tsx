export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-32 md:py-48">
      <h1 className="max-w-3xl text-center text-5xl font-light leading-tight tracking-tight md:text-7xl">
        Curated Art Prints
      </h1>
      <p className="mt-6 max-w-xl text-center text-lg text-muted-foreground md:text-xl">
        Discover and collect limited-edition posters from independent artists.
        Each print is produced on demand with gallery-quality materials.
      </p>
      <div className="mt-10">
        <a
          href="#artists"
          className="inline-flex items-center border-b border-foreground pb-1 text-sm font-medium tracking-wide uppercase transition-opacity hover:opacity-60"
        >
          Explore Artists
        </a>
      </div>
    </section>
  );
}
