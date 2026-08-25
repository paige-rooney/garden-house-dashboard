const SAFE_NAME = /[^a-zA-Z0-9._-]+/g;

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "audio/wav",
  "audio/x-wav",
  "audio/aiff",
  "audio/mpeg",
  "audio/flac",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "font/ttf",
  "font/otf",
  "font/woff",
  "font/woff2",
  "video/mp4",
  "video/quicktime",
]);

export function sanitizeFileName(name: string) {
  const base = name.split(/[/\\]/).pop() || "file";
  const cleaned = base.replace(SAFE_NAME, "-").replace(/-+/g, "-").slice(0, 120);
  return cleaned || "file";
}

export function assertAllowedUpload(options: { mimeType: string; byteSize: number; purpose?: string }) {
  if (!ALLOWED_MIME_TYPES.has(options.mimeType)) {
    throw new Error("That file type is not allowed.");
  }
  const audio = options.mimeType.startsWith("audio/");
  const max = audio ? 250 * 1024 * 1024 : 50 * 1024 * 1024;
  if (options.byteSize > max) {
    throw new Error(audio ? "Audio files must be 250 MB or smaller." : "Files must be 50 MB or smaller.");
  }
}

export function buildObjectKey(options: {
  environment: string;
  purpose: string;
  clientId?: string | null;
  projectId?: string | null;
  fileName: string;
}) {
  const safe = sanitizeFileName(options.fileName);
  const id = crypto.randomUUID();
  return [
    options.environment,
    options.purpose,
    options.clientId || "studio",
    options.projectId || "none",
    `${id}-${safe}`,
  ].join("/");
}
