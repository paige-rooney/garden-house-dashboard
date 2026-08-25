"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
  onDataChanged: () => Promise<void>;
};

export function ContractsPanel({ data, onDataChanged }: Props) {
  const { templates, projects, contracts, clients } = data;
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [projectId, setProjectId] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [signUrl, setSignUrl] = useState("");

  useEffect(() => {
    if (!templates.some((template) => template.id === templateId) && templates[0]) {
      setTemplateId(templates[0].id);
    }
  }, [templates, templateId]);

  const filteredProjects = useMemo(() => {
    const needle = projectQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const client = clients.find((item) => item.id === project.clientId);
      const haystack = `${project.title} ${client?.name ?? ""}`.toLowerCase();
      return needle ? haystack.includes(needle) : true;
    });
  }, [projects, clients, projectQuery]);

  async function sendContract() {
    if (!templateId || !projectId) {
      setStatus("error");
      setMessage("Choose a template and a project first.");
      return;
    }
    setStatus("sending");
    setSignUrl("");
    const response = await fetch("/api/contracts/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, projectId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "Could not send.");
      return;
    }
    setStatus("sent");
    setSignUrl(payload.signUrl || "");
    setMessage(payload.signUrl ? "Sent. Open the test signing link below." : "Sent to the client email on file.");
    await onDataChanged();
  }

  const selectedProject = projects.find((project) => project.id === projectId);
  const selectedClient = clients.find((item) => item.id === selectedProject?.clientId);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-2 font-semibold">Send a contract</h3>
        <p className="mb-3 text-sm text-brand-muted">
          Templates merge client and project details, then email the CRM address. This is an
          operational draft — have an attorney review language before relying on it legally.
        </p>
        <label className="text-sm font-medium">Template</label>
        <select
          className="mb-3 mt-1 w-full rounded-lg border border-brand-green/20 px-3 py-2"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <label className="text-sm font-medium">Project</label>
        <input
          className="mt-1 w-full rounded-lg border border-brand-green/20 px-3 py-2 text-sm"
          placeholder="Search project or client name"
          value={projectQuery}
          onChange={(event) => setProjectQuery(event.target.value)}
        />
        <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
          {filteredProjects.length === 0 && (
            <p className="text-sm text-brand-muted">No matching projects.</p>
          )}
          {filteredProjects.map((project) => {
            const client = clients.find((item) => item.id === project.clientId);
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setProjectId(project.id)}
                className={`w-full rounded-lg border p-3 text-left ${
                  projectId === project.id ? "border-brand-green bg-brand-green/10" : "border-brand-green/20"
                }`}
              >
                <p className="font-medium">{project.title}</p>
                <p className="text-xs text-brand-muted">{client?.name ?? "No client"}</p>
              </button>
            );
          })}
        </div>
        {selectedProject && (
          <p className="mt-2 text-xs text-brand-muted">
            Sending for <strong>{selectedProject.title}</strong>
            {selectedClient ? ` · ${selectedClient.name}` : ""}
          </p>
        )}
        <button
          className="mt-3 rounded bg-brand-green px-4 py-2 text-sm text-white"
          onClick={() => void sendContract()}
          disabled={!templateId || !projectId}
        >
          {status === "sending" ? "Sending..." : "Send to client email"}
        </button>
        {message && (
          <p className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-brand-green"}`}>{message}</p>
        )}
        {signUrl && status === "sent" && (
          <a className="mt-2 inline-block rounded bg-brand-green px-3 py-2 text-sm text-white" href={signUrl} target="_blank" rel="noreferrer">
            Open test signing page
          </a>
        )}
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Contract activity</h3>
        {contracts.length === 0 && <p className="text-sm text-brand-muted">No contracts yet.</p>}
        <ul className="space-y-2 text-sm">
          {contracts.map((contract) => (
            <li key={contract.id} className="rounded-lg border border-brand-green/20 p-3">
              <p className="font-medium">{contract.title}</p>
              <p className="text-xs text-brand-muted">
                {contract.status} · {contract.sentTo || "not sent"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
