"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SignContractPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("Review the agreement, type your full name, and sign.");

  useEffect(() => {
    void fetch(`/api/contracts/view?token=${token}`).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) setMessage(payload.error || "This signing link is not valid.");
    });
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setState("loading");
    const response = await fetch("/api/contracts/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, signatureName: name }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState("error");
      setMessage(payload.error || "Could not sign.");
      return;
    }
    setState("done");
    setMessage("Signed. A copy stays in the Garden House dashboard.");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Sign your Garden House agreement</h1>
      <p className="mt-2 text-sm text-brand-muted">
        This is an operational signing flow. Legal language should be reviewed by Garden House or an
        attorney before relying on it in a dispute.
      </p>
      <form className="mt-6 rounded-2xl bg-brand-surface p-6 shadow-soft" onSubmit={onSubmit}>
        <label className="text-sm font-medium" htmlFor="signature">
          Type your full legal name
        </label>
        <input
          id="signature"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-lg border border-brand-green/20 px-3 py-2"
        />
        <button className="mt-4 rounded-lg bg-brand-green px-4 py-2 text-white" disabled={state === "loading" || state === "done"}>
          {state === "loading" ? "Signing..." : "Sign agreement"}
        </button>
        <p className="mt-3 text-sm text-brand-muted">{message}</p>
      </form>
    </main>
  );
}
