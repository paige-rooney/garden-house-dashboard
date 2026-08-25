import { DashboardData } from "@/lib/types";

export function PaymentsPanel({ data }: { data: DashboardData }) {
  const { invoices, payments, clients, projects } = data;

  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-1 font-semibold">Payments (Stripe test mode)</h3>
      <p className="mb-3 text-sm text-brand-muted">
        Live charges stay off until you approve them. Paid, failed, overdue, void, and refunded
        statuses update from Stripe webhooks.
      </p>
      {invoices.length === 0 && <p className="text-sm text-brand-muted">No invoices yet.</p>}
      <div className="grid gap-2">
        {invoices.map((invoice) => {
          const invoicePayments = payments.filter((payment) => payment.invoiceId === invoice.id);
          const client = clients.find((item) => item.id === invoice.clientId);
          const project = projects.find((item) => item.id === invoice.projectId);
          return (
            <div key={invoice.id} className="rounded-lg border border-brand-green/20 p-3 text-sm">
              <p><strong>Client:</strong> {client?.name ?? "Unknown"}</p>
              <p><strong>Project:</strong> {project?.title ?? "Unknown"}</p>
              <p><strong>Amount:</strong> ${invoice.amountUsd.toLocaleString()}</p>
              <p><strong>Status:</strong> {invoice.status}</p>
              <p><strong>Due:</strong> {invoice.dueDate || "—"}</p>
              {invoice.hostedInvoiceUrl && (
                <p className="mt-2">
                  <a
                    className="inline-block rounded bg-brand-green px-3 py-1 text-xs text-white"
                    href={invoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open test invoice
                  </a>
                </p>
              )}
              <p>
                <strong>Payments:</strong>{" "}
                {invoicePayments.length
                  ? invoicePayments.map((payment) => `${payment.status} $${payment.amountUsd}`).join(", ")
                  : "None yet"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
