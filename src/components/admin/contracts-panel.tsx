"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const templates = [
  "Single Song Production Agreement",
  "EP Production + Mixing Agreement",
  "Cowrite Collaboration Agreement",
];

export function ContractsPanel() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [projectId, setProjectId] = useState("p1");
  const [status, setStatus] = useState("idle");

  async function sendContract() {
    setStatus("sending");
    const response = await fetch("/api/contracts/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: selectedTemplate, projectId }),
    });
    setStatus(response.ok ? "sent" : "error");
  }

  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-3 font-semibold">Contracts</h3>
      <p className="mb-3 text-sm text-brand-muted">
        Use a pre-built template, customize project details, add drag-and-drop signature/date
        fields, then send to the client.
      </p>
      <label className="mb-2 block text-sm font-medium">Template</label>
      <select
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
        className="mb-3 w-full rounded-lg border border-brand-green/20 px-3 py-2"
      >
        {templates.map((template) => (
          <option key={template} value={template}>
            {template}
          </option>
        ))}
      </select>
      <label className="mb-2 block text-sm font-medium">Project ID</label>
      <input
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="mb-3 w-full rounded-lg border border-brand-green/20 px-3 py-2"
      />
      <div className="rounded-lg border border-dashed border-brand-green/30 p-3 text-sm">
        Signature fields: [Client Signature] [Date Signed] [Studio Signature]
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" onClick={sendContract}>
          Send to client email
        </Button>
        {status === "sent" && <span className="text-sm text-brand-green">Sent.</span>}
        {status === "error" && <span className="text-sm text-red-600">Failed to send.</span>}
      </div>
    </div>
  );
}
