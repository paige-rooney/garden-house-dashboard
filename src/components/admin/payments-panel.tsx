import { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
};

export function PaymentsPanel({ data }: Props) {
  const { invoices, payments, clients, projects } = data;

  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-1 font-semibold">Payments (Stripe)</h3>
      <p className="mb-3 text-sm text-brand-muted">
        Invoices created from Projects sync here. When Stripe marks an invoice paid, status updates
        automatically via webhook.
      </p>
      <div className="grid gap-2">
        {invoices.length === 0 && (
          <p className="text-sm text-brand-muted">
            No invoices yet. Open a project and use &ldquo;Create Stripe invoice&rdquo;.
          </p>
        )}
        {invoices.map((invoice) => {
          const invoicePayments = payments.filter((payment) => payment.invoiceId === invoice.id);
          const client = clients.find((item) => item.id === invoice.clientId);
          const project = projects.find((item) => item.id === invoice.projectId);

          return (
            <div key={invoice.id} className="rounded-lg border border-brand-green/20 p-3 text-sm">
              <p>
                <strong>Client:</strong> {client?.name ?? "Unknown"}
              </p>
              <p>
                <strong>Project:</strong> {project?.title ?? "Unknown"}
              </p>
              <p>
                <strong>Amount:</strong> ${invoice.amountUsd.toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {invoice.status}
              </p>
              <p>
                <strong>Due:</strong> {invoice.dueDate || "—"}
              </p>
              <p>
                <strong>Stripe invoice:</strong> {invoice.stripeInvoiceId ?? "Not linked"}
              </p>
              <p>
                <strong>Payment plan:</strong> {invoice.status === "plan" ? "Active plan" : "N/A"}
              </p>
              <p>
                <strong>Payment records:</strong>{" "}
                {invoicePayments.length
                  ? invoicePayments
                      .map((payment) => `${payment.status} $${payment.amountUsd}`)
                      .join(", ")
                  : "No payments yet"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
