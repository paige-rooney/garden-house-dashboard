import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth/staff";
import { LogoutButton } from "@/components/admin/logout-button";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-green/10 bg-brand-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-muted">Garden House</p>
            <h1 className="text-lg font-semibold">Studio operations</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link className="text-brand-muted hover:text-brand-green" href="/">
              Public site
            </Link>
            <span className="text-brand-muted">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </div>
  );
}
