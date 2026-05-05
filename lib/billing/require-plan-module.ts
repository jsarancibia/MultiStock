import type { AppModule } from "@/config/navigation";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { canBusinessUseModule } from "@/lib/billing/plan-guards";

export async function getPlanModuleAccess(module: AppModule) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);

  return {
    business,
    allowed: canBusinessUseModule(business, module),
  };
}
