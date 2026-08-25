"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileUploader } from "@/components/admin/file-uploader";
import { DashboardData, ProjectStatus } from "@/lib/types";

type Props = {
  data: DashboardData;
  onDataChanged: () => Promise<void>;
};

export function ProjectsPanel({ data, onDataChanged }: Props) {
  const { clients, invoices, projects, files, contracts } = data;
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [formState, setFormState] = useState<"idle" | "saving" | "error">("idle");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceState, setInvoiceState] = useState<"idle" | "creating" | "sent" | "error">("idle");
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    songCount: 1,
    status: "tracking" as ProjectStatus,
    dueDate: "",
    budgetUsd: 0,
    notes: "",
  });

  const filteredClients = useMemo(
    () => clients.filter((client) => client.status === status),
    [clients, status],
  );
  const selectedProjects = useMemo(
    () => projects.filter((project) => project.clientId === clientId),
    [projects, clientId],
  );
  const selectedProject = projects.find((project) => project.id === projectId);
  const [projectNotes, setProjectNotes] = useState(selectedProject?.notes ?? "");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(selectedProject?.status ?? "tracking");
  const projectInvoices = invoices.filter((invoice) => invoice.projectId === projectId);
  const projectFiles = files.filter((file) => file.projectId === projectId);
  const projectContracts = contracts.filter((contract) => contract.projectId === projectId);

  useEffect(() => {
    setProjectNotes(selectedProject?.notes ?? "");
    setProjectStatus(selectedProject?.status ?? "tracking");
  }, [selectedProject]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientId) return;
    setFormState("saving");
    const response = await fetch("/api/dashboard/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, ...newProject }),
    });
    if (!response.ok) {
      setFormState("error");
      return;
    }
    setNewProject({ title: "", songCount: 1, status: "tracking", dueDate: "", budgetUsd: 0, notes: "" });
    await onDataChanged();
    setFormState("idle");
  }

  async function saveProject() {
    if (!selectedProject) return;
    setFormState("saving");
    const response = await fetch("/api/dashboard/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedProject.id,
        notes: projectNotes,
        status: projectStatus,
      }),
    });
    if (!response.ok) {
      setFormState("error");
      return;
    }
    await onDataChanged();
    setFormState("idle");
  }

  async function archiveProject() {
    if (!selectedProject) return;
    if (!confirm(`Archive ${selectedProject.title}?`)) return;
    await fetch("/api/dashboard/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedProject.id, archived: true }),
    });
    await onDataChanged();
  }

  async function downloadFile(fileKey: string) {
    const response = await fetch(`/api/files?key=${encodeURIComponent(fileKey)}&projectId=${projectId}`);
    const payload = await response.json();
    if (payload.url) window.open(payload.url, "_blank");
  }

  async function createStripeInvoice() {
    if (!selectedProject) return;
    const amountUsd = Number(invoiceAmount);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      setInvoiceState("error");
      setInvoiceMessage("Enter a valid invoice amount.");
      return;
    }
    setInvoiceState("creating");
    const response = await fetch("/api/dashboard/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProject.id,
        amountUsd,
        description: `${selectedProject.title} — Garden House session`,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setInvoiceState("error");
      setInvoiceMessage(payload.error || "Could not create invoice.");
      return;
    }
    setInvoiceAmount("");
    setInvoiceState("sent");
    setInvoiceMessage(payload.hostedInvoiceUrl ? "Stripe invoice created and emailed." : "Stripe invoice created.");
    await onDataChanged();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Clients</h3>
          <button onClick={() => setStatus(status === "active" ? "inactive" : "active")} className="rounded bg-brand-green px-3 py-1 text-xs text-white">
            {status === "active" ? "Show inactive" : "Show active"}
          </button>
        </div>
        {filteredClients.length === 0 && <p className="text-sm text-brand-muted">No clients in this list yet.</p>}
        <ul className="space-y-2">
          {filteredClients.map((client) => (
            <li key={client.id}>
              <button className={`w-full rounded-lg border px-3 py-2 text-left ${clientId === client.id ? "border-brand-green bg-brand-green/10" : "border-brand-green/20"}`} onClick={() => setClientId(client.id)}>
                <p className="font-medium">{client.name}</p>
                <p className="text-xs text-brand-muted">{client.email}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Projects</h3>
        <div className="grid gap-3">
          {selectedProjects.map((project) => (
            <button key={project.id} onClick={() => setProjectId(project.id)} className={`rounded-lg border p-3 text-left ${projectId === project.id ? "border-brand-green bg-brand-green/10" : "border-brand-green/20"}`}>
              <p className="font-medium">{project.title}</p>
              <p className="text-xs text-brand-muted">Status: {project.status}</p>
            </button>
          ))}
        </div>
        <form className="mt-4 grid gap-2 border-t border-brand-green/10 pt-4" onSubmit={createProject}>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Add project</p>
          <input required placeholder="Project title" className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" value={newProject.title} onChange={(e) => setNewProject((c) => ({ ...c, title: e.target.value }))} />
          <input type="number" min={1} className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm" value={newProject.songCount} onChange={(e) => setNewProject((c) => ({ ...c, songCount: Math.max(1, Number(e.target.value || 1)) }))} />
          <button className="rounded bg-brand-green px-3 py-2 text-xs text-white" type="submit">Create project</button>
        </form>
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Project details</h3>
        {selectedProject ? (
          <div className="space-y-2 text-sm">
            <p>{selectedProject.songCount} songs · due {selectedProject.dueDate || "—"} · ${selectedProject.budgetUsd.toLocaleString()}</p>
            <label className="block text-xs font-medium">Status</label>
            <select className="w-full rounded-lg border border-brand-green/20 px-3 py-2" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}>
              <option value="tracking">tracking</option>
              <option value="mixing">mixing</option>
              <option value="mastering">mastering</option>
              <option value="complete">complete</option>
            </select>
            <p><strong>Contracts:</strong> {projectContracts.map((c) => `${c.title} (${c.status})`).join(", ") || "None"}</p>
            <div>
              <p className="mb-1 font-semibold">Files</p>
              {projectFiles.length === 0 && <p className="text-xs text-brand-muted">No files yet.</p>}
              {projectFiles.map((file) => (
                <button key={file.id} className="mr-2 mt-1 rounded border border-brand-green/20 px-2 py-1 text-xs" onClick={() => void downloadFile(file.fileKey)}>
                  {file.fileName}
                </button>
              ))}
              <div className="mt-2">
                <FileUploader purpose="project" clientId={selectedProject.clientId} projectId={selectedProject.id} onUploaded={onDataChanged} />
              </div>
            </div>
            <div>
              <p className="mb-1 font-semibold">Invoices</p>
              {projectInvoices.map((invoice) => (
                <p key={invoice.id} className="text-xs">
                  ${invoice.amountUsd} — {invoice.status}
                  {invoice.hostedInvoiceUrl && (
                    <a className="ml-2 underline" href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">Open Stripe</a>
                  )}
                </p>
              ))}
              <div className="mt-2 flex gap-2">
                <input type="number" min="1" step="0.01" placeholder="Amount USD" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} className="w-32 rounded-lg border border-brand-green/20 px-2 py-1 text-xs" />
                <button type="button" className="rounded bg-brand-green px-3 py-1 text-xs text-white" onClick={() => void createStripeInvoice()}>
                  {invoiceState === "creating" ? "Creating..." : "Create Stripe invoice"}
                </button>
              </div>
              {invoiceMessage && <p className={`mt-2 text-xs ${invoiceState === "error" ? "text-red-600" : "text-brand-green"}`}>{invoiceMessage}</p>}
            </div>
            <textarea className="h-28 w-full rounded-lg border border-brand-green/20 p-2" value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} />
            <div className="flex gap-2">
              <button className="rounded bg-brand-green px-3 py-2 text-xs text-white" onClick={() => void saveProject()}>Save</button>
              <button className="rounded border border-red-300 px-3 py-2 text-xs text-red-700" onClick={() => void archiveProject()}>Archive</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Select a project.</p>
        )}
        {formState === "error" && <p className="mt-2 text-xs text-red-600">Save failed.</p>}
      </div>
    </div>
  );
}
