import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { createClient } from "@/lib/supabase/server";
import { canBusinessUseModule } from "@/lib/billing/plan-guards";
import { businessTypes } from "@/config/business-types";
import { loadExportSourceRows } from "@/lib/reports/export-queries";
import { buildProductsExcel } from "@/lib/reports/excel/generators/products-report";
import { buildInventoryExcel } from "@/lib/reports/excel/generators/inventory-report";
import { buildMovementsExcel } from "@/lib/reports/excel/generators/movements-report";
import { buildSalesExcel } from "@/lib/reports/excel/generators/sales-report";
import { buildAlertsExcel } from "@/lib/reports/excel/generators/alerts-report";
import type { ExcelReportContext } from "@/lib/reports/excel/core/workbook";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ report: string }> };

const reportFileNames: Record<string, string> = {
  productos: "productos",
  inventario: "inventario",
  movimientos: "movimientos",
  ventas: "ventas",
  alertas: "alertas",
};

export async function GET(_request: Request, { params }: Params) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);

  if (!canBusinessUseModule(business, "exports")) {
    return NextResponse.json({ error: "Plan sin acceso a exportaciones." }, { status: 403 });
  }

  const { report } = await params;
  if (!(report in reportFileNames)) {
    return NextResponse.json({ error: "Reporte no soportado." }, { status: 404 });
  }

  const supabase = await createClient();
  const src = await loadExportSourceRows(supabase, business.id);

  const businessTypeLabel = businessTypes[business.business_type]?.label ?? business.business_type;
  const ctx: ExcelReportContext = {
    businessId: business.id,
    businessName: business.name,
    businessTypeLabel,
    exportedAt: new Date(),
    exporterEmail: user.email,
    timeZone: process.env.APP_TIMEZONE || "America/Santiago",
  };

  let buffer: Buffer;
  switch (report) {
    case "productos":
      buffer = await buildProductsExcel(ctx, src.products);
      break;
    case "inventario":
      buffer = await buildInventoryExcel(ctx, src.inventoryProducts);
      break;
    case "movimientos":
      buffer = await buildMovementsExcel(ctx, src.movements);
      break;
    case "ventas":
      buffer = await buildSalesExcel(ctx, src.sales);
      break;
    case "alertas":
      buffer = await buildAlertsExcel(ctx, src.alerts);
      break;
    default:
      return NextResponse.json({ error: "Reporte no soportado." }, { status: 404 });
  }

  const fileName = `${reportFileNames[report]}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
