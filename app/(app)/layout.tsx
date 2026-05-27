import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BusinessSwitcher } from "@/components/layout/business-switcher";
import { businessTypes } from "@/config/business-types";
import { getNavigationForBusinessType, type NavigationItem } from "@/config/navigation";
import { isAdmin } from "@/lib/auth/is-admin";
import { requireUser } from "@/lib/auth/session";
import { getBusinessRole } from "@/lib/auth/require-business-role";
import { createClient } from "@/lib/supabase/server";
import {
  listUserBusinesses,
  requireActiveBusiness,
  setActiveBusinessAction,
} from "@/lib/business/get-active-business";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const user = await requireUser();
  const userIsAdmin = await isAdmin(user);
  const businesses = await listUserBusinesses(user.id);
  const business = await requireActiveBusiness(user.id);
  const businessType = businessTypes[business.business_type];
  const baseNavigation = getNavigationForBusinessType(
    business.business_type,
    business.subscription_plan
  );

  // Conteo de alertas no resueltas para el badge en sidebar
  const supabase = await createClient();
  const { count: alertCount } = await supabase
    .from("stock_alerts")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("resolved", false);

  const navigation: NavigationItem[] = userIsAdmin
    ? [...baseNavigation, { label: "Admin Panel", href: "/admin", module: "admin" }]
    : baseNavigation;

  // Filtrar navegación según rol: employee solo ve módulos esenciales
  const employeeModules = ["dashboard", "products", "inventory", "sales", "fiados"];
  const userBusinessRole = !userIsAdmin ? await getBusinessRole(user.id, business.id) : null;
  const finalNavigation = userBusinessRole === "employee"
    ? navigation.filter((item) => employeeModules.includes(item.module))
    : navigation;

  async function switchBusinessAction(
    _state: { ok?: boolean } | undefined,
    formData: FormData
  ) {
    "use server";
    await setActiveBusinessAction(formData);
    return { ok: true };
  }

  return (
    <AppShell
      header={
        <AppHeader
          businessName={business.name}
          businessTypeLabel={businessType.label}
          userEmail={user.email ?? "Sin email"}
          switcher={
            <BusinessSwitcher
              businesses={businesses}
              activeBusinessId={business.id}
              action={switchBusinessAction}
            />
          }
        />
      }
      sidebar={<AppSidebar items={finalNavigation} alertCount={alertCount ?? 0} />}
    >
      {children}
    </AppShell>
  );
}
