"use client";

import { useState } from "react";

type Props = {
  purpose: "project" | "contract" | "marketing" | "brand";
  clientId?: string;
  projectId?: string;
  category?: string;
  onUploaded?: () => Promise<void> | void;
};

export function FileUploader({ purpose, clientId, projectId, category, onUploaded }: Props) {
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  async function onChange(file: File | undefined) {
    if (!file) return;
    setState("uploading");
    setProgress(5);
    setMessage("");
    try {
      const sign = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          byteSize: file.size,
          purpose,
          clientId,
          projectId,
          visibility: purpose === "brand" ? "private" : "private",
        }),
      });
      const signed = await sign.json();
      if (!sign.ok) throw new Error(signed.error || "Could not start upload.");
      setProgress(25);
      const put = await fetch(signed.url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error("The file did not upload to storage.");
      setProgress(80);
      const complete = await fetch("/api/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: signed.key,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          byteSize: file.size,
          purpose,
          clientId,
          projectId,
          category,
          name: file.name,
        }),
      });
      const done = await complete.json();
      if (!complete.ok) throw new Error(done.error || "Uploaded, but saving the record failed.");
      setProgress(100);
      setState("done");
      setMessage("Uploaded.");
      await onUploaded?.();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <div className="grid gap-2">
      <input
        type="file"
        onChange={(event) => void onChange(event.target.files?.[0])}
        className="block w-full text-sm"
      />
      {state === "uploading" && (
        <div className="h-2 overflow-hidden rounded bg-brand-green/10">
          <div className="h-full bg-brand-green" style={{ width: `${progress}%` }} />
        </div>
      )}
      {message && <p className={`text-xs ${state === "error" ? "text-red-600" : "text-brand-green"}`}>{message}</p>}
    </div>
  );
}
