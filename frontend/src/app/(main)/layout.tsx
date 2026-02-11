import { Separator } from "@/components/ui/separator";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <a href="/" className="text-lg font-medium tracking-tight">
          GinkoPosters
        </a>
        <nav className="flex items-center gap-6">
          <a
            href="#artists"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Artists
          </a>
          <a
            href="/admin/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </a>
        </nav>
      </header>

      <Separator />

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Separator />
      <footer className="px-6 py-8 md:px-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GinkoPosters
          </span>
          <span className="text-sm text-muted-foreground">
            Curated art prints from independent artists
          </span>
        </div>
      </footer>
    </div>
  );
}
