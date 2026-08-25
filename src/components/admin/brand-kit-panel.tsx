"use client";

import { FileUploader } from "@/components/admin/file-uploader";
import { DashboardData } from "@/lib/types";

export function BrandKitPanel({ data, onDataChanged }: { data: DashboardData; onDataChanged: () => Promise<void> }) {
  async function download(key: string) {
    const response = await fetch(`/api/files?key=${encodeURIComponent(key)}`);
    const payload = await response.json();
    if (payload.url) window.open(payload.url, "_blank");
  }

  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-2 font-semibold">Brand kit</h3>
      <p className="mb-3 text-sm text-brand-muted">
        Logos, fonts, color references, templates, photos, video, and documents. Files stay private unless marked public.
      </p>
      <FileUploader purpose="brand" category="logo" onUploaded={onDataChanged} />
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {data.brandAssets.length === 0 && <li className="text-sm text-brand-muted">No brand assets uploaded yet.</li>}
        {data.brandAssets.map((asset) => (
          <li key={asset.id} className="rounded-lg border border-brand-green/20 p-3 text-sm">
            <p className="font-medium">{asset.name}</p>
            <p className="text-xs text-brand-muted">{asset.category} · {asset.visibility} {asset.versionLabel ? `· ${asset.versionLabel}` : ""}</p>
            <button className="mt-2 text-xs underline" onClick={() => void download(asset.r2Key)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
