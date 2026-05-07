import { movementTypeLabel } from "@/lib/business/movement-type-labels";
import { buildReportBuffer, type ExcelReportContext, type ReportColumn } from "../core/workbook";

type MovementRow = {
  created_at: string;
  type: string;
  quantity: number | string;
  reason: string | null;
};

export async function buildMovementsExcel(
  ctx: ExcelReportContext,
  rows: MovementRow[]
): Promise<Buffer> {
  const columns: ReportColumn[] = [
    { header: "Fecha", key: "fecha", width: 22, align: "left" },
    { header: "Tipo", key: "tipo", width: 18, align: "center" },
    { header: "Cantidad", key: "cantidad", width: 12, type: "number", align: "right" },
    { header: "Motivo", key: "motivo", width: 36, align: "left" },
  ];

  return buildReportBuffer(ctx, {
    sheetName: "Movimientos",
    title: "Reporte de Movimientos",
    description: "Entradas, salidas y ajustes de stock con motivo.",
    theme: "minimal-gray",
    footer: true,
    summary: [{ label: "Total Movimientos", value: rows.length, type: "primary" }],
    columns,
    rows: rows.map((m) => ({
      fecha: m.created_at,
      tipo: movementTypeLabel(m.type as never),
      cantidad: Number(m.quantity ?? 0),
      motivo: m.reason ?? "",
    })),
  });
}
