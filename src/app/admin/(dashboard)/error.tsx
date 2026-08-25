"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-semibold">The dashboard hit an error</h2>
      <p className="mt-2 text-sm">{error.message}</p>
      <button className="mt-4 rounded bg-brand-green px-3 py-2 text-sm text-white" onClick={reset}>
        Reload
      </button>
    </div>
  );
}
