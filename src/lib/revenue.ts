const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type PaymentLike = {
  amountUsd: number;
  status: string;
  paidAt?: string | null;
};

export function buildRevenueFromPayments(payments: PaymentLike[], year = new Date().getFullYear()): {
  month: string;
  monthly: number;
  quarterly: number;
  ytd: number;
  oneYear: number;
  fiveYear: number;
}[] {
  const monthTotals = Array.from({ length: 12 }, () => 0);

  for (const payment of payments) {
    if (payment.status !== "paid" || !payment.paidAt) continue;
    const date = new Date(payment.paidAt);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) continue;
    const amount = Number(payment.amountUsd ?? 0);
    monthTotals[date.getMonth()] += Number.isFinite(amount) ? amount : 0;
  }

  let ytd = 0;
  return MONTHS.map((month, idx) => {
    const monthly = monthTotals[idx];
    ytd += monthly;
    const quarterStart = Math.floor(idx / 3) * 3;
    const quarterly = monthTotals.slice(quarterStart, idx + 1).reduce((sum, val) => sum + val, 0);
    return {
      month,
      monthly,
      quarterly,
      ytd,
      oneYear: ytd,
      fiveYear: ytd,
    };
  });
}

export function paymentsToCsv(rows: Array<{ paidAt: string; amountUsd: number; client?: string; project?: string; invoiceId?: string }>) {
  const header = "paid_at,amount_usd,client,project,invoice_id";
  const body = rows
    .map((row) =>
      [row.paidAt, row.amountUsd, row.client ?? "", row.project ?? "", row.invoiceId ?? ""]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}\n`;
}
