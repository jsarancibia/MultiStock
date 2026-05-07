import { categoryLabel, type ProductExportSource } from "@/lib/reports/export-queries";
import { buildReportBuffer, type ExcelReportContext, type ReportColumn } from "../core/workbook";

export async function buildProductsExcel(
  ctx: ExcelReportContext,
  rows: ProductExportSource[]
): Promise<Buffer> {
  const activeCount = rows.filter((r) => r.active).length;
  const inactiveCount = rows.length - activeCount;

  const columns: ReportColumn[] = [
    { header: "Codigo", key: "codigo", width: 18, align: "center" },
    { header: "Descripcion", key: "descripcion", width: 36, align: "left" },
    { header: "Unidad", key: "unidad", width: 12, align: "center" },
    { header: "Categoria", key: "categoria", width: 18, align: "left" },
    { header: "Precio Venta", key: "precio_venta", width: 14, type: "currency", align: "right" },
    { header: "Estado", key: "estado", width: 12, type: "status", align: "center" },
    { header: "SKU", key: "sku", width: 16, align: "center" },
    { header: "Codigo Barras", key: "codigo_barras", width: 22, align: "center" },
  ];

  return buildReportBuffer(ctx, {
    sheetName: "Productos",
    title: "Reporte de Productos",
    description: "Catalogo de productos con unidad, categoria, precio y estado.",
    theme: "multistock",
    footer: true,
    summary: [
      { label: "Total Productos", value: rows.length, type: "primary" },
      { label: "Activos", value: activeCount, type: "info" },
      { label: "Inactivos", value: inactiveCount, type: "warning" },
    ],
    columns,
    rows: rows.map((p) => ({
      codigo:
        typeof p.sku === "string" && p.sku.trim()
          ? p.sku.trim()
          : typeof p.barcode === "string" && p.barcode.trim()
            ? p.barcode.trim()
            : "-",
      descripcion: p.name,
      unidad: p.unit_type,
      categoria: categoryLabel(p),
      precio_venta: p.sale_price == null ? 0 : Number(p.sale_price),
      estado: p.active ? "Activo" : "Inactivo",
      sku: p.sku ?? "",
      codigo_barras: p.barcode ?? "",
    })),
    conditionalRules: [
      {
        columnKey: "estado",
        conditions: [
          { operator: "eq", threshold: "Inactivo", styleKey: "statusWarn" },
          { operator: "eq", threshold: "Activo", styleKey: "statusOk" },
        ],
      },
    ],
  });
}
