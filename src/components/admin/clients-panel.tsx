"use client";

import { FormEvent, useMemo, useState } from "react";
import { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
  onDataChanged: () => Promise<void>;
};

export function ClientsPanel({ data, onDataChanged }: Props) {
  const { clients, projects } = data;
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    status: "active" as "active" | "inactive",
    notes: "",
  });
  const [savingState, setSavingState] = useState<"idle" | "saving" | "error">("idle");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId],
  );
  const [editableNotes, setEditableNotes] = useState(selectedClient?.notes ?? "");

  async function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingState("saving");
    const response = await fetch("/api/dashboard/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });
    if (!response.ok) {
      setSavingState("error");
      return;
    }
    setNewClient({ name: "", email: "", phone: "", instagram: "", status: "active", notes: "" });
    await onDataChanged();
    setSavingState("idle");
  }

  async function saveClientNotes() {
    if (!selectedClient) return;
    setSavingState("saving");
    const response = await fetch("/api/dashboard/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedClient.id, notes: editableNotes }),
    });
    if (!response.ok) {
      setSavingState("error");
      return;
    }
    await onDataChanged();
    setSavingState("idle");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Client CRM</h3>
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id}>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-left ${selectedClientId === client.id ? "border-brand-green bg-brand-green/10" : "border-brand-green/20"}`}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setEditableNotes(client.notes);
                }}
              >
                <p className="font-medium">
                  {client.name} <span className="text-xs text-brand-muted">({client.status})</span>
                </p>
                <p className="text-xs text-brand-muted">{client.email}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Selected Client</h3>
        {selectedClient ? (
          <div className="space-y-2 text-sm">
            <p>
              {selectedClient.email} | {selectedClient.phone}
            </p>
            <p>
              Current/Past Projects:{" "}
              {projects
                .filter((project) => project.clientId === selectedClient.id)
                .map((project) => project.title)
                .join(", ") || "None"}
            </p>
            <textarea
              className="h-28 w-full rounded-lg border border-brand-green/20 p-2"
              value={editableNotes}
              onChange={(event) => setEditableNotes(event.target.value)}
            />
            <button className="rounded bg-brand-green px-3 py-2 text-xs text-white" onClick={saveClientNotes}>
              Save Notes
            </button>
            <p className="text-xs text-brand-muted">Files: lyrics/chord charts upload via R2 signed links.</p>
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Select a client to edit notes.</p>
        )}
      </section>

      <section className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Add Client</h3>
        <form className="grid gap-2" onSubmit={createClient}>
          <input
            required
            placeholder="Full name"
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newClient.name}
            onChange={(event) => setNewClient((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newClient.email}
            onChange={(event) => setNewClient((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            placeholder="Phone"
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newClient.phone}
            onChange={(event) => setNewClient((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            placeholder="Instagram"
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newClient.instagram}
            onChange={(event) => setNewClient((current) => ({ ...current, instagram: event.target.value }))}
          />
          <select
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newClient.status}
            onChange={(event) =>
              setNewClient((current) => ({
                ...current,
                status: event.target.value as "active" | "inactive",
              }))
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <textarea
            placeholder="Starting notes"
            className="h-24 rounded-lg border border-brand-green/20 p-2 text-sm"
            value={newClient.notes}
            onChange={(event) => setNewClient((current) => ({ ...current, notes: event.target.value }))}
          />
          <button className="rounded bg-brand-green px-3 py-2 text-sm text-white" type="submit">
            Create Client
          </button>
          {savingState === "error" && (
            <p className="text-xs text-red-600">
              Save failed. Confirm Supabase env keys are set, then retry.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
