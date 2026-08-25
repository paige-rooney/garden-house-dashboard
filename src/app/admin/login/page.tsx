"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [state, setState] = useState<"idle" | "loading" | "error" | "sent">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin` },
        });
        if (error) throw error;
        setState("sent");
        setMessage("Check your email for a sign-in link.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.assign("/admin");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
      <form className="w-full rounded-2xl bg-brand-surface p-6 shadow-soft" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">Garden House staff sign in</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Use your individual staff email. Shared PINs are no longer used.
        </p>
        <label className="mt-4 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-green/20 px-3 py-2"
        />
        {mode === "password" && (
          <>
            <label className="mt-3 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-brand-green/20 px-3 py-2"
            />
          </>
        )}
        <button className="mt-4 w-full rounded-lg bg-brand-green px-4 py-2 text-white" type="submit">
          {state === "loading" ? "Signing in..." : mode === "magic" ? "Email me a link" : "Sign in"}
        </button>
        <button
          type="button"
          className="mt-3 w-full text-sm text-brand-muted underline"
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
        >
          {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
        </button>
        {message && (
          <p className={`mt-3 text-sm ${state === "error" ? "text-red-600" : "text-brand-green"}`}>{message}</p>
        )}
      </form>
    </main>
  );
}
