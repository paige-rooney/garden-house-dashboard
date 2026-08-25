import { AdminTabs } from "@/components/admin/admin-tabs";

export default function AdminHomePage() {
  return (
    <main>
      <h1 className="mb-2 text-3xl font-semibold">Garden House Admin Dashboard</h1>
      <p className="mb-6 text-sm text-brand-muted">
        Clients, projects, invoices, contracts, files, marketing, and bookings. Changes save to the
        studio database.
      </p>
      <AdminTabs />
    </main>
  );
}
