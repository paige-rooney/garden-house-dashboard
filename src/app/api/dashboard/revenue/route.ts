import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { jsonError } from "@/lib/http";
import { paymentsToCsv } from "@/lib/revenue";
import { getDashboardData } from "@/lib/data/dashboard-data";

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request, { minRole: "admin" });
    const data = await getDashboardData();
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const format = url.searchParams.get("format");

    const clientsById = new Map(data.clients.map((client) => [client.id, client]));
    const projectsById = new Map(data.projects.map((project) => [project.id, project]));
    const invoicesById = new Map(data.invoices.map((invoice) => [invoice.id, invoice]));

    const rows = data.payments
      .filter((payment) => payment.status === "paid" && payment.paidAt)
      .filter((payment) => {
        if (from && payment.paidAt && payment.paidAt < from) return false;
        if (to && payment.paidAt && payment.paidAt > to) return false;
        return true;
      })
      .map((payment) => {
        const invoice = invoicesById.get(payment.invoiceId);
        return {
          paidAt: payment.paidAt ?? "",
          amountUsd: payment.amountUsd,
          client: invoice ? clientsById.get(invoice.clientId)?.name : "",
          project: invoice ? projectsById.get(invoice.projectId)?.title : "",
          invoiceId: payment.invoiceId,
        };
      });

    if (format === "csv") {
      return new NextResponse(paymentsToCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=garden-house-revenue.csv",
        },
      });
    }

    const total = rows.reduce((sum, row) => sum + row.amountUsd, 0);
    return NextResponse.json({ total, count: rows.length, rows, revenue: data.revenue });
  } catch (error) {
    return jsonError(error);
  }
}
