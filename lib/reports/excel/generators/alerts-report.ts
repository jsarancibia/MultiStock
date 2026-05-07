import { buildReportBuffer, type ExcelReportContext, type ReportColumn } from "../core/workbook";

type AlertRow = {
  created_at: string;
  type: string;
  message: string;
  resolved: boolean;
};

export async function buildAlertsExcel(
  ctx: ExcelReportContext,
  rows: AlertRow[]
): Promise<Buffer> {
  const pending = rows.filter((a) => !a.resolved).length;

  const columns: ReportColumn[] = [
    { header: "Fecha", key: "fecha", width: 22, align: "left" },
    { header: "Tipo", key: "tipo", width: 16, align: "center" },
    { header: "Mensaje", key: "mensaje", width: 42, align: "left" },
    { header: "Estado", key: "estado", width: 14, type: "status", align: "center" },
  ];

  return buildReportBuffer(ctx, {
    sheetName: "Alertas",
    title: "Reporte de Alertas",
    description: "Alertas operativas con estado pendiente o resuelta.",
    theme: "dark-professional",
    footer: true,
    summary: [
      { label: "Total Alertas", value: rows.length, type: "primary" },
      { label: "Pendientes", value: pending, type: "warning" },
    ],
    columns,
    rows: rows.map((a) => ({
      fecha: a.created_at,
      tipo: a.type,
      mensaje: a.message,
      estado: a.resolved ? "Resuelta" : "Pendiente",
    })),
    conditionalRules: [
      {
        columnKey: "estado",
        conditions: [
          { operator: "eq", threshold: "Pendiente", styleKey: "statusWarn" },
          { operator: "eq", threshold: "Resuelta", styleKey: "statusOk" },
        ],
      },
    ],
  });
}
