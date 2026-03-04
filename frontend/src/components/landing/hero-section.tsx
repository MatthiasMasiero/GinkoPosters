"use client";

import Image from "next/image";
import { FadeIn } from "@/components/landing/fade-in";

const FALLBACK_IMAGE = "/posters/matthias/new-york.avif";

interface HeroPoster {
  src: string;
  alt: string;
}

interface HeroSectionProps {
  posters?: HeroPoster[];
}

export function HeroSection({ posters = [] }: HeroSectionProps) {
  const heroImage = posters.length > 0
    ? posters[0]
    : { src: FALLBACK_IMAGE, alt: "Art poster" };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Desktop: editorial split */}
      <div className="hidden md:grid md:grid-cols-2 md:min-h-screen">
        {/* Image left */}
        <div className="relative overflow-hidden">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="50vw"
            className="ken-burns object-cover"
          />
        </div>

        {/* Content right */}
        <div className="flex flex-col justify-center px-10 py-24 lg:px-20">
          <FadeIn delay={100}>
            <p className="label-uppercase text-muted-foreground">
              Curated Art Prints
            </p>
          </FadeIn>
          <FadeIn delay={250}>
            <h1 className="mt-6 text-5xl font-extrabold uppercase leading-[0.9] tracking-tight lg:text-7xl xl:text-[5.5rem]">
              Discover
              <br />
              Independent
              <br />
              Artists
            </h1>
          </FadeIn>
          <FadeIn delay={400}>
            <p className="mt-8 max-w-md text-base text-muted-foreground">
              Collect limited-edition posters from independent artists.
              Premium quality, produced on demand and shipped to your door.
            </p>
          </FadeIn>
          <FadeIn delay={550}>
            <a
              href="#collection"
              className="mt-10 inline-flex w-fit items-center bg-foreground px-8 py-4 text-xs font-extrabold uppercase tracking-[0.08em] text-background transition-opacity duration-200 hover:opacity-80"
            >
              Explore the Collection
            </a>
          </FadeIn>

        </div>
      </div>

      {/* Mobile: image background with overlay */}
      <div className="relative flex min-h-screen items-end md:hidden">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative z-10 px-6 pb-20 pt-32 text-white">
          <FadeIn delay={100}>
            <p className="label-uppercase text-white/60">Curated Art Prints</p>
          </FadeIn>
          <FadeIn delay={250}>
            <h1 className="mt-4 text-4xl font-extrabold uppercase leading-[0.9] tracking-tight">
              Discover
              <br />
              Independent
              <br />
              Artists
            </h1>
          </FadeIn>
          <FadeIn delay={400}>
            <p className="mt-6 max-w-xs text-sm text-white/70">
              Collect limited-edition posters from independent artists.
              Premium quality, produced on demand.
            </p>
          </FadeIn>
          <FadeIn delay={550}>
            <a
              href="#collection"
              className="mt-8 inline-flex items-center bg-background px-8 py-4 text-xs font-extrabold uppercase tracking-[0.08em] text-foreground transition-opacity duration-200 hover:opacity-80"
            >
              Explore the Collection
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
