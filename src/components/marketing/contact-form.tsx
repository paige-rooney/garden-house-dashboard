"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  instagram: "",
  location: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      setState("ok");
      setForm(initialForm);
      return;
    }

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setErrorMessage(payload?.error ?? "Unable to send right now.");
    setState("error");
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          required
          placeholder="First name"
          className="rounded-lg border border-brand-green/20 px-3 py-2"
          value={form.firstName}
          onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
        />
        <input
          required
          placeholder="Last name"
          className="rounded-lg border border-brand-green/20 px-3 py-2"
          value={form.lastName}
          onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
        />
      </div>
      <input
        type="email"
        required
        placeholder="Email"
        className="rounded-lg border border-brand-green/20 px-3 py-2"
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          placeholder="Instagram"
          className="rounded-lg border border-brand-green/20 px-3 py-2"
          value={form.instagram}
          onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
        />
        <input
          placeholder="Location"
          className="rounded-lg border border-brand-green/20 px-3 py-2"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
        />
      </div>
      <textarea
        required
        rows={5}
        placeholder="Message"
        className="rounded-lg border border-brand-green/20 px-3 py-2"
        value={form.message}
        onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Sending..." : "Submit"}
        </Button>
        {state === "ok" && <p className="text-sm text-brand-green">Message sent.</p>}
        {state === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    </form>
  );
}
