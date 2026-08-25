"use client";

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-brand-muted">{error.message || "Reload this page and try again."}</p>
      <button className="mt-4 rounded bg-brand-green px-4 py-2 text-white" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
