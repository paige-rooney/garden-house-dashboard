import { AdminTabs } from "@/components/admin/admin-tabs";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-4 text-3xl font-semibold">Garden House Admin Dashboard</h1>
      <AdminTabs />
    </main>
  );
}
