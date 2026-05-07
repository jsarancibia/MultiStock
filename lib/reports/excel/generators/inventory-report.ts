import { categoryLabel, type ProductExportSource } from "@/lib/reports/export-queries";
import {
  inventarioEstadoCalculado,
  inventarioSolicitarEtiqueta,
} from "@/lib/reports/inventory-stock-status";
import { buildReportBuffer, type ExcelReportContext, type ReportColumn } from "../core/workbook";

export async function buildInventoryExcel(
  ctx: ExcelReportContext,
  rows: ProductExportSource[]
): Promise<Buffer> {
  const lowStock = rows.filter((p) => {
    const actual = Number(p.current_stock ?? 0);
    const min = Number(p.min_stock ?? 0);
    return Number.isFinite(min) && min > 0 && actual < min;
  }).length;

  const critical = rows.filter((p) => Number(p.current_stock ?? 0) <= 0).length;

  const columns: ReportColumn[] = [
    { header: "Nombre", key: "nombre", width: 32, align: "left" },
    { header: "SKU", key: "sku", width: 16, align: "center" },
    { header: "Codigo Barras", key: "codigo_barras", width: 20, align: "center" },
    { header: "Stock Actual", key: "stock_actual", width: 12, type: "stock", align: "right" },
    { header: "Stock Minimo", key: "stock_minimo", width: 12, type: "number", align: "right" },
    { header: "Unidad", key: "unidad", width: 12, align: "center" },
    { header: "Estado Stock", key: "estado_stock", width: 16, type: "status", align: "center" },
    { header: "Solicitar", key: "solicitar", width: 18, align: "center" },
    { header: "Categoria", key: "categoria", width: 18, align: "left" },
  ];

  return buildReportBuffer(ctx, {
    sheetName: "Inventario",
    title: "Reporte de Inventario",
    description: "Control de stock por producto, con estado calculado y sugerencia de reposicion.",
    theme: "corporate-blue",
    footer: true,
    summary: [
      { label: "Total Items", value: rows.length, type: "primary" },
      { label: "Stock Bajo", value: lowStock, type: "warning" },
      { label: "Stock Critico", value: critical, type: "danger" },
    ],
    columns,
    rows: rows.map((p) => {
      const stk = Number(p.current_stock ?? 0);
      const min = Number(p.min_stock ?? 0);
      return {
        nombre: p.name,
        sku: p.sku ?? "",
        codigo_barras: p.barcode ?? "",
        stock_actual: Number.isFinite(stk) ? stk : 0,
        stock_minimo: Number.isFinite(min) ? min : 0,
        unidad: p.unit_type,
        estado_stock: inventarioEstadoCalculado(stk, min),
        solicitar: inventarioSolicitarEtiqueta(stk, min),
        categoria: categoryLabel(p),
      };
    }),
    conditionalRules: [
      {
        columnKey: "stock_actual",
        conditions: [
          { operator: "lte", threshold: 0, styleKey: "statusAlert" },
          { operator: "lte", threshold: 5, styleKey: "statusWarn" },
        ],
      },
      {
        columnKey: "estado_stock",
        conditions: [
          { operator: "contains", threshold: "critico", styleKey: "statusAlert" },
          { operator: "contains", threshold: "bajo", styleKey: "statusWarn" },
          { operator: "eq", threshold: "OK", styleKey: "statusOk" },
        ],
      },
    ],
  });
}
