"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 bg-foreground px-6 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-80"
      >
        Try Again
      </button>
    </div>
  );
}
