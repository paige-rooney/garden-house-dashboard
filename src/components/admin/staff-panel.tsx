"use client";

import { FormEvent, useEffect, useState } from "react";

type StaffRow = { id: string; email: string; full_name: string; role: string; status: string };

export function StaffPanel() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/staff");
    const payload = await response.json();
    if (response.ok) setStaff(payload.staff ?? []);
    else setMessage(payload.error || "You need owner access to invite staff.");
  }

  useEffect(() => {
    void load();
  }, []);

  async function invite(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const payload = await response.json();
    setMessage(payload.error || (payload.ok ? "Invite saved. They will get a sign-in email if Supabase invites are enabled." : "Could not invite."));
    if (payload.ok) {
      setEmail("");
      await load();
    }
  }

  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-2 font-semibold">Staff access</h3>
      <p className="mb-3 text-sm text-brand-muted">
        Owner, admin, and staff roles. Only the owner can invite. The first signed-in person becomes
        owner if the owner email is set (or in development).
      </p>
      <ul className="mb-4 space-y-2 text-sm">
        {staff.map((person) => (
          <li key={person.id} className="rounded border border-brand-green/20 px-3 py-2">
            {person.full_name || person.email} · {person.role} · {person.status}
          </li>
        ))}
      </ul>
      <form className="flex flex-wrap gap-2" onSubmit={invite}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@email.com" className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm">
          <option value="staff">staff</option>
          <option value="admin">admin</option>
          <option value="owner">owner</option>
        </select>
        <button className="rounded bg-brand-green px-3 py-2 text-sm text-white" type="submit">Invite</button>
      </form>
      {message && <p className="mt-2 text-xs text-brand-muted">{message}</p>}
    </div>
  );
}
