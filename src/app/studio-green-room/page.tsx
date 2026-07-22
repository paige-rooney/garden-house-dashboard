"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPinPage() {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");

    const response = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (response.ok) {
      router.push("/studio-green-room/dashboard");
      return;
    }

    setState("error");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
      <form className="w-full rounded-2xl bg-brand-surface p-6 shadow-soft" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">Admin Access</h1>
        <p className="mt-1 text-sm text-brand-muted">Enter the 6-digit PIN.</p>
        <input
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="mt-4 w-full rounded-lg border border-brand-green/20 px-3 py-2"
          placeholder="000000"
        />
        <button className="mt-4 w-full rounded-lg bg-brand-green px-4 py-2 text-white">
          {state === "loading" ? "Verifying..." : "Unlock dashboard"}
        </button>
        {state === "error" && <p className="mt-2 text-sm text-red-600">Invalid PIN.</p>}
      </form>
    </main>
  );
}
