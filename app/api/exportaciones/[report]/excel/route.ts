import { NextResponse } from "next/server";
import { businessTypes } from "@/config/business-types";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";
import { canBusinessUseModule } from "@/lib/billing/plan-guards";
import {
  buildCategoryExcelBuffer,
  isExportReportKey,
  reportFileLabel,
} from "@/lib/reports/build-category-excel";
import { loadExportSourceRows } from "@/lib/reports/export-queries";
import { createClient } from "@/lib/supabase/server";
import { asciiFileSlug } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ report: string }> }
) {
  const { report } = await context.params;
  if (!isExportReportKey(report)) {
    return NextResponse.json({ message: "Reporte invalido." }, { status: 404 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const business = await getActiveBusiness(user.id);
  if (!business) {
    return NextResponse.json({ message: "No hay negocio activo." }, { status: 404 });
  }

  if (!canBusinessUseModule(business, "exports")) {
    return NextResponse.json({ message: "Plan sin exportaciones." }, { status: 403 });
  }

  const supabase = await createClient();
  const source = await loadExportSourceRows(supabase, business.id);
  const exportedAt = new Date();
  const buffer = await buildCategoryExcelBuffer({
    reportKey: report,
    context: {
      businessId: business.id,
      businessName: business.name,
      businessTypeLabel: businessTypes[business.business_type].label,
      exportedAt,
      exporterEmail: user.email ?? null,
    },
    source,
  });

  const businessSlug = asciiFileSlug(business.name);
  const filename = `MultiStock-${reportFileLabel(report)}-${businessSlug}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
