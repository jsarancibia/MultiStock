import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { businessTypes } from "@/config/business-types";
import { getNavigationForBusinessType } from "@/config/navigation";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const businessType = businessTypes[business.business_type];
  const navigation = getNavigationForBusinessType(business.business_type);

  return (
    <div className="min-h-dvh bg-muted/20">
      <AppHeader
        businessName={business.name}
        businessTypeLabel={businessType.label}
        userEmail={user.email ?? "Sin email"}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col md:min-h-[calc(100dvh-65px)] md:flex-row">
        <AppSidebar items={navigation} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
