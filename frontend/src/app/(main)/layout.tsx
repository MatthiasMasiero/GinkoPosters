"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const hidden = scrollDirection === "down" && !isAtTop;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Fixed glassmorphism header */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-12 ${isAtTop ? "" : "glass"}`}
        style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="flex min-h-[44px] min-w-[44px] items-center justify-center">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-sm border-r-0 p-0"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-0 pt-16">
                <Link
                  href="/"
                  className="px-8 py-5 text-2xl font-extrabold uppercase tracking-tight transition-colors hover:bg-muted"
                >
                  Home
                </Link>
                <Link
                  href="/gallery"
                  className="px-8 py-5 text-2xl font-extrabold uppercase tracking-tight transition-colors hover:bg-muted"
                >
                  Gallery
                </Link>
                <Link
                  href="#collection"
                  className="px-8 py-5 text-2xl font-extrabold uppercase tracking-tight transition-colors hover:bg-muted"
                >
                  Artists
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link
          href="/"
          className="text-sm font-extrabold uppercase tracking-[0.08em]"
        >
          GinkoPosters
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/gallery"
            className="group relative text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <span className="transition-opacity duration-200 group-hover:opacity-0">
              Gallery
            </span>
            <span className="absolute inset-0 italic opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Gallery
            </span>
          </Link>
          <Link
            href="#collection"
            className="group relative text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <span className="transition-opacity duration-200 group-hover:opacity-0">
              Artists
            </span>
            <span className="absolute inset-0 italic opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Artists
            </span>
          </Link>
        </nav>

        {/* Mobile spacer to balance hamburger */}
        <div className="w-6 md:hidden" />
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Minimal footer */}
      <footer className="bg-foreground text-white">
        <div className="mx-auto max-w-7xl px-6 py-5 md:px-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em]">GinkoPosters</p>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="#collection" className="text-xs text-white/60 transition-colors duration-200 hover:text-white">The Collection</Link>
              <Link href="/storefront/support" className="text-xs text-white/60 transition-colors duration-200 hover:text-white">Support</Link>
              <Link href="#collection" className="text-xs text-white/60 transition-colors duration-200 hover:text-white">Artists</Link>
              <Link href="/storefront/legal" className="text-xs text-white/60 transition-colors duration-200 hover:text-white">Legal</Link>
            </nav>
            <span className="text-xs text-white/40">&copy; {new Date().getFullYear()} GinkoPosters</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
