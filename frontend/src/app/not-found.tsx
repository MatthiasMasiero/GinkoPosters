import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 bg-foreground px-6 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-80"
      >
        Back to Home
      </Link>
    </div>
  );
}
