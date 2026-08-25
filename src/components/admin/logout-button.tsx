"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="rounded-lg border border-brand-green/20 px-3 py-1.5 text-sm"
    >
      Sign out
    </button>
  );
}
