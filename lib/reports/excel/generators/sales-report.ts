import { paymentMethodLabels } from "@/lib/validations/sale";
import { buildReportBuffer, type ExcelReportContext, type ReportColumn } from "../core/workbook";

type SaleRow = {
  created_at: string;
  total: number | string;
  payment_method: string | null;
};

export async function buildSalesExcel(
  ctx: ExcelReportContext,
  rows: SaleRow[]
): Promise<Buffer> {
  const totalAmount = rows.reduce((acc, row) => acc + Number(row.total ?? 0), 0);

  const columns: ReportColumn[] = [
    { header: "Fecha", key: "fecha", width: 22, align: "left" },
    { header: "Total", key: "total", width: 14, type: "currency", align: "right" },
    { header: "Metodo Pago", key: "metodo_pago", width: 18, align: "center" },
  ];

  return buildReportBuffer(ctx, {
    sheetName: "Ventas",
    title: "Reporte de Ventas",
    description: "Ventas registradas con total y metodo de pago.",
    theme: "dark-professional",
    footer: true,
    summary: [
      { label: "Total Ventas", value: rows.length, type: "primary" },
      { label: "Monto Total", value: `$${new Intl.NumberFormat("es-CL").format(totalAmount)}`, type: "info" },
    ],
    columns,
    rows: rows.map((s) => ({
      fecha: s.created_at,
      total: Number(s.total ?? 0),
      metodo_pago:
        s.payment_method && s.payment_method in paymentMethodLabels
          ? paymentMethodLabels[s.payment_method as keyof typeof paymentMethodLabels]
          : (s.payment_method ?? "No definido"),
    })),
  });
}
