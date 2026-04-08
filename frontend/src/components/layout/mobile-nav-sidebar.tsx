"use client";

import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { useArtist } from "@/hooks/use-artist";
import { FadeIn } from "@/components/landing/fade-in";

interface MobileNavSidebarProps {
  children: React.ReactNode;
}

export function MobileNavSidebar({ children }: MobileNavSidebarProps) {
  const { itemCount } = useCart();
  const { artist } = useArtist();
  const artistParam = artist?.slug ? `?artist=${artist.slug}` : "";

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="left"
        className="w-full max-w-full border-r-0 bg-foreground p-0 text-background"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <nav className="relative z-10 flex flex-col gap-0 pt-20">
          <FadeIn delay={100}>
            <SheetClose asChild>
              <Link
                href={`/storefront${artistParam}`}
                className="min-h-[48px] px-8 py-6 text-4xl font-extrabold uppercase tracking-tight text-background transition-colors hover:text-background/60"
              >
                Shop
              </Link>
            </SheetClose>
          </FadeIn>
          <FadeIn delay={200}>
            <SheetClose asChild>
              <Link
                href={`/storefront/cart${artistParam}`}
                className="flex min-h-[48px] items-center gap-3 px-8 py-6 text-4xl font-extrabold uppercase tracking-tight text-background transition-colors hover:text-background/60"
              >
                Cart
                {itemCount > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-red text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </SheetClose>
          </FadeIn>
          <FadeIn delay={300}>
            <SheetClose asChild>
              <Link
                href={`/storefront/support${artistParam}`}
                className="min-h-[48px] px-8 py-6 text-4xl font-extrabold uppercase tracking-tight text-background transition-colors hover:text-background/60"
              >
                Support
              </Link>
            </SheetClose>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="mx-8 my-4 h-px bg-background/10" />
            <SheetClose asChild>
              <Link
                href="/"
                className="min-h-[48px] px-8 py-5 text-lg font-extrabold uppercase tracking-[0.08em] text-background/40 transition-colors hover:text-background/60"
              >
                GinkoPosters
              </Link>
            </SheetClose>
          </FadeIn>
        </nav>

        {/* Faded artist watermark */}
        {artist?.name && (
          <div className="pointer-events-none absolute bottom-12 left-8 right-8 overflow-hidden">
            <p className="text-7xl font-extrabold uppercase leading-none tracking-tight text-background/[0.03]">
              {artist.name}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
