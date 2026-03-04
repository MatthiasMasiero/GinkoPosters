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
      <SheetContent side="left" className="w-full max-w-sm border-r-0 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0 pt-16">
          <SheetClose asChild>
            <Link
              href={`/storefront${artistParam}`}
              className="min-h-[48px] px-8 py-5 text-2xl font-extrabold uppercase tracking-tight transition-colors hover:bg-muted"
            >
              Shop
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href={`/storefront/cart${artistParam}`}
              className="flex min-h-[48px] items-center gap-3 px-8 py-5 text-2xl font-extrabold uppercase tracking-tight transition-colors hover:bg-muted"
            >
              Cart
              {itemCount > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-red text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href={`/storefront/support${artistParam}`}
              className="min-h-[48px] px-8 py-5 text-2xl font-extrabold uppercase tracking-tight transition-colors hover:bg-muted"
            >
              Support
            </Link>
          </SheetClose>
          <div className="mx-8 my-4 h-px bg-border" />
          <SheetClose asChild>
            <Link
              href="/"
              className="min-h-[48px] px-8 py-5 text-lg font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              GinkoPosters
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
