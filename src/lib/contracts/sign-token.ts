export function normalizeSignToken(raw: unknown) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  try {
    return decodeURIComponent(trimmed).replace(/\/+$/, "").trim();
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}
