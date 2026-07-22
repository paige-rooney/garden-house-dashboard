import { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
};

export function PaymentsPanel({ data }: Props) {
  const { invoices, payments } = data;
  return (
    <div className="rounded-2xl bg-brand-surface p-4 shadow-soft">
      <h3 className="mb-3 font-semibold">Payments (Stripe)</h3>
      <div className="grid gap-2">
        {invoices.map((invoice) => {
          const invoicePayments = payments.filter((payment) => payment.invoiceId === invoice.id);
          return (
          <div key={invoice.id} className="rounded-lg border border-brand-green/20 p-3 text-sm">
            <p>
              <strong>Invoice:</strong> {invoice.id}
            </p>
            <p>
              <strong>Amount:</strong> ${invoice.amountUsd}
            </p>
            <p>
              <strong>Status:</strong> {invoice.status}
            </p>
            <p>
              <strong>Due:</strong> {invoice.dueDate}
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
