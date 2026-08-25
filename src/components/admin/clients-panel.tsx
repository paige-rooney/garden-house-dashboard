"use client";

import { FormEvent, useMemo, useState } from "react";
import { FileUploader } from "@/components/admin/file-uploader";
import { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
  onDataChanged: () => Promise<void>;
};

export function ClientsPanel({ data, onDataChanged }: Props) {
  const { clients, projects, invoices, contracts, files } = data;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    website: "",
    status: "active" as "active" | "inactive",
    notes: "",
  });

  const filtered = useMemo(
    () =>
      clients.filter((client) => {
        if (statusFilter !== "all" && client.status !== statusFilter) return false;
        const haystack = `${client.name} ${client.email} ${client.instagram ?? ""}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [clients, query, statusFilter],
  );
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const [editable, setEditable] = useState(selectedClient);

  const clientProjects = projects.filter((project) => project.clientId === selectedClient?.id);
  const clientInvoices = invoices.filter((invoice) => invoice.clientId === selectedClient?.id);
  const clientContracts = contracts.filter((contract) => contract.clientId === selectedClient?.id);
  const clientFiles = files.filter((file) => file.clientId === selectedClient?.id);

  async function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingState("saving");
    const response = await fetch("/api/dashboard/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSavingState("error");
      setError(payload.error || "Could not create client.");
      return;
    }
    setNewClient({ name: "", email: "", phone: "", instagram: "", website: "", status: "active", notes: "" });
    await onDataChanged();
    setSavingState("saved");
  }

  async function saveClient() {
    if (!selectedClient || !editable) return;
    setSavingState("saving");
    const response = await fetch("/api/dashboard/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedClient.id,
        name: editable.name,
        email: editable.email,
        phone: editable.phone,
        instagram: editable.instagram,
        notes: editable.notes,
        status: editable.status,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSavingState("error");
      setError(payload.error || "Could not save client.");
      return;
    }
    await onDataChanged();
    setSavingState("saved");
  }

  async function archiveClient() {
    if (!selectedClient) return;
    if (!confirm(`Archive ${selectedClient.name}? They will be hidden from the active list.`)) return;
    const response = await fetch("/api/dashboard/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedClient.id, archived: true }),
    });
    if (response.ok) await onDataChanged();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Client CRM</h3>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, Instagram"
          className="mb-2 w-full rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
        />
        <select
          className="mb-3 w-full rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {filtered.length === 0 && <p className="text-sm text-brand-muted">No clients match this search.</p>}
        <ul className="space-y-2">
          {filtered.map((client) => (
            <li key={client.id}>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-left ${selectedClientId === client.id ? "border-brand-green bg-brand-green/10" : "border-brand-green/20"}`}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setEditable(client);
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
        <h3 className="mb-3 font-semibold">Selected client</h3>
        {selectedClient && editable ? (
          <div className="space-y-2 text-sm">
            <input className="w-full rounded-lg border border-brand-green/20 px-3 py-2" value={editable.name} onChange={(e) => setEditable({ ...editable, name: e.target.value })} />
            <input className="w-full rounded-lg border border-brand-green/20 px-3 py-2" value={editable.email} onChange={(e) => setEditable({ ...editable, email: e.target.value })} />
            <input className="w-full rounded-lg border border-brand-green/20 px-3 py-2" value={editable.phone} onChange={(e) => setEditable({ ...editable, phone: e.target.value })} placeholder="Phone" />
            <input className="w-full rounded-lg border border-brand-green/20 px-3 py-2" value={editable.instagram ?? ""} onChange={(e) => setEditable({ ...editable, instagram: e.target.value })} placeholder="Instagram" />
            <textarea className="h-24 w-full rounded-lg border border-brand-green/20 p-2" value={editable.notes} onChange={(e) => setEditable({ ...editable, notes: e.target.value })} />
            <div className="flex gap-2">
              <button className="rounded bg-brand-green px-3 py-2 text-xs text-white" onClick={() => void saveClient()}>
                Save
              </button>
              <button className="rounded border border-red-300 px-3 py-2 text-xs text-red-700" onClick={() => void archiveClient()}>
                Archive
              </button>
            </div>
            <p><strong>Projects:</strong> {clientProjects.map((p) => p.title).join(", ") || "None"}</p>
            <p><strong>Invoices:</strong> {clientInvoices.length}</p>
            <p><strong>Contracts:</strong> {clientContracts.map((c) => `${c.title} (${c.status})`).join(", ") || "None"}</p>
            <p><strong>Files:</strong> {clientFiles.map((f) => f.fileName).join(", ") || "None"}</p>
            {savingState === "saved" && <p className="text-xs text-brand-green">Saved.</p>}
            {savingState === "error" && <p className="text-xs text-red-600">{error}</p>}
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Select a client to edit.</p>
        )}
      </section>

      <section className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Add client</h3>
        <form className="grid gap-2" onSubmit={createClient}>
          <input required placeholder="Full name" className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" value={newClient.name} onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))} />
          <input required type="email" placeholder="Email" className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" value={newClient.email} onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))} />
          <input placeholder="Phone" className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" value={newClient.phone} onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))} />
          <input placeholder="Instagram" className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" value={newClient.instagram} onChange={(e) => setNewClient((c) => ({ ...c, instagram: e.target.value }))} />
          <button className="rounded bg-brand-green px-3 py-2 text-sm text-white" type="submit">Create client</button>
        </form>
        {selectedClient && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">Upload a file for this client</p>
            <FileUploader
              purpose="project"
              clientId={selectedClient.id}
              projectId={clientProjects[0]?.id}
              onUploaded={onDataChanged}
            />
          </div>
        )}
      </section>
    </div>
  );
}
