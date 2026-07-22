"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
  onDataChanged: () => Promise<void>;
};

export function ProjectsPanel({ data, onDataChanged }: Props) {
  const { clients, invoices, projects } = data;
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [clientId, setClientId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [projectNotes, setProjectNotes] = useState("");
  const [formState, setFormState] = useState<"idle" | "saving" | "error">("idle");
  const [newProject, setNewProject] = useState({
    title: "",
    songCount: 1,
    status: "tracking" as "tracking" | "mixing" | "mastering" | "complete",
    dueDate: "",
    budgetUsd: 0,
    notes: "",
  });

  useEffect(() => {
    const firstClient = clients.find((client) => client.status === status);
    setClientId((current) => (current && clients.some((client) => client.id === current) ? current : firstClient?.id ?? ""));
  }, [clients, status]);

  useEffect(() => {
    const firstProject = projects.find((project) => project.clientId === clientId);
    setProjectId((current) =>
      current && projects.some((project) => project.id === current) ? current : firstProject?.id ?? "",
    );
  }, [projects, clientId]);

  const filteredClients = useMemo(() => clients.filter((c) => c.status === status), [status]);
  const selectedProjects = useMemo(() => projects.filter((p) => p.clientId === clientId), [clientId]);
  const selectedProject = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectInvoices = useMemo(() => invoices.filter((i) => i.projectId === projectId), [projectId]);

  useEffect(() => {
    setProjectNotes(selectedProject?.notes ?? "");
  }, [selectedProject?.id]);

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
    setNewProject({
      title: "",
      songCount: 1,
      status: "tracking",
      dueDate: "",
      budgetUsd: 0,
      notes: "",
    });
    await onDataChanged();
    setFormState("idle");
  }

  async function saveProjectNotes() {
    if (!selectedProject) return;
    setFormState("saving");
    const response = await fetch("/api/dashboard/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedProject.id,
        notes: projectNotes,
        status: selectedProject.status,
      }),
    });
    if (!response.ok) {
      setFormState("error");
      return;
    }
    await onDataChanged();
    setFormState("idle");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Clients</h3>
          <button
            onClick={() => setStatus(status === "active" ? "inactive" : "active")}
            className="rounded bg-brand-green px-3 py-1 text-xs text-white"
          >
            {status === "active" ? "Show inactive" : "Show active"}
          </button>
        </div>
        <ul className="space-y-2">
          {filteredClients.map((client) => (
            <li key={client.id}>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-left ${clientId === client.id ? "border-brand-green bg-brand-green/10" : "border-brand-green/20"}`}
                onClick={() => setClientId(client.id)}
              >
                <p className="font-medium">{client.name}</p>
                <p className="text-xs text-brand-muted">{client.email}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Projects (Kanban by status)</h3>
        <div className="grid gap-3">
          {selectedProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setProjectId(project.id)}
              className={`rounded-lg border p-3 text-left ${projectId === project.id ? "border-brand-green bg-brand-green/10" : "border-brand-green/20"}`}
            >
              <p className="font-medium">{project.title}</p>
              <p className="text-xs text-brand-muted">Status: {project.status}</p>
            </button>
          ))}
        </div>
        <form className="mt-4 grid gap-2 border-t border-brand-green/10 pt-4" onSubmit={createProject}>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Add project</p>
          <input
            required
            placeholder="Project title"
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newProject.title}
            onChange={(event) => setNewProject((current) => ({ ...current, title: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
              value={newProject.songCount}
              onChange={(event) =>
                setNewProject((current) => ({
                  ...current,
                  songCount: Math.max(1, Number(event.target.value || 1)),
                }))
              }
            />
            <select
              className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
              value={newProject.status}
              onChange={(event) =>
                setNewProject((current) => ({
                  ...current,
                  status: event.target.value as "tracking" | "mixing" | "mastering" | "complete",
                }))
              }
            >
              <option value="tracking">tracking</option>
              <option value="mixing">mixing</option>
              <option value="mastering">mastering</option>
              <option value="complete">complete</option>
            </select>
          </div>
          <input
            type="date"
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newProject.dueDate}
            onChange={(event) => setNewProject((current) => ({ ...current, dueDate: event.target.value }))}
          />
          <input
            type="number"
            min={0}
            placeholder="Budget USD"
            className="rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
            value={newProject.budgetUsd}
            onChange={(event) =>
              setNewProject((current) => ({ ...current, budgetUsd: Number(event.target.value || 0) }))
            }
          />
          <button className="rounded bg-brand-green px-3 py-2 text-xs text-white" type="submit">
            Create Project
          </button>
        </form>
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Project Details</h3>
        {selectedProject ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>Metadata:</strong> {selectedProject.songCount} songs, due{" "}
              {selectedProject.dueDate}
            </p>
            <p>
              <strong>Files:</strong> Demo assets linked in CRM files section
            </p>
            <p>
              <strong>Status:</strong> {selectedProject.status}
            </p>
            <p>
              <strong>Budget:</strong> ${selectedProject.budgetUsd.toLocaleString()}
            </p>
            <div>
              <p className="mb-1 font-semibold">Invoicing</p>
              <ul className="space-y-1">
                {projectInvoices.map((invoice) => (
                  <li key={invoice.id} className="rounded border border-brand-green/20 px-2 py-1 text-xs">
                    {invoice.id}: ${invoice.amountUsd} ({invoice.status})
                  </li>
                ))}
              </ul>
            </div>
            <p className="font-semibold">Notes</p>
            <textarea
              className="h-28 w-full rounded-lg border border-brand-green/20 p-2"
              value={projectNotes}
              onChange={(event) => setProjectNotes(event.target.value)}
            />
            <button className="w-fit rounded bg-brand-green px-3 py-2 text-xs text-white" onClick={saveProjectNotes}>
              Save Notes
            </button>
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Select a project to view metadata.</p>
        )}
        {formState === "error" && (
          <p className="mt-2 text-xs text-red-600">Save failed. Confirm Supabase is configured and try again.</p>
        )}
      </div>
    </div>
  );
}
