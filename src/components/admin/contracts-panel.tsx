"use client";

import { useState } from "react";
import { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
  onDataChanged: () => Promise<void>;
};

export function ContractsPanel({ data, onDataChanged }: Props) {
  const { templates, projects, contracts, clients } = data;
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendContract() {
    setStatus("sending");
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
    setMessage(
      payload.signUrl
        ? `Sent. Test signing link: ${payload.signUrl}`
        : "Sent to the client email on file.",
    );
    await onDataChanged();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-2 font-semibold">Send a contract</h3>
        <p className="mb-3 text-sm text-brand-muted">
          Templates merge client and project details, then email the CRM address. This is an
          operational draft — have an attorney review language before relying on it legally.
        </p>
        <label className="text-sm font-medium">Template</label>
        <select className="mb-3 mt-1 w-full rounded-lg border border-brand-green/20 px-3 py-2" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
        <label className="text-sm font-medium">Project</label>
        <select className="mb-3 mt-1 w-full rounded-lg border border-brand-green/20 px-3 py-2" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((project) => {
            const client = clients.find((item) => item.id === project.clientId);
            return (
              <option key={project.id} value={project.id}>
                {project.title} {client ? `(${client.name})` : ""}
              </option>
            );
          })}
        </select>
        <button className="rounded bg-brand-green px-4 py-2 text-sm text-white" onClick={() => void sendContract()} disabled={!templateId || !projectId}>
          {status === "sending" ? "Sending..." : "Send to client email"}
        </button>
        {message && <p className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-brand-green"}`}>{message}</p>}
      </div>
      <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
        <h3 className="mb-3 font-semibold">Contract activity</h3>
        {contracts.length === 0 && <p className="text-sm text-brand-muted">No contracts yet.</p>}
        <ul className="space-y-2 text-sm">
          {contracts.map((contract) => (
            <li key={contract.id} className="rounded-lg border border-brand-green/20 p-3">
              <p className="font-medium">{contract.title}</p>
              <p className="text-xs text-brand-muted">{contract.status} · {contract.sentTo || "not sent"}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
