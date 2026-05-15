import { requirePageAccess } from "@/lib/auth/require-page-access";
import { TeamPage } from "@/components/team/team-page";
import { getMemberQuota } from "@/lib/billing/get-quota";
import { PlanUpgradeBanner } from "@/components/billing/plan-upgrade-banner";

export default async function Page() {
  const { business } = await requirePageAccess(["owner"]);
  const memberQuota = await getMemberQuota(business);

  return (
    <>
      <PlanUpgradeBanner
        quota={memberQuota}
        plan={business.subscription_plan}
        resourceLabel="Miembros del equipo"
        resourceUnit="miembros"
      />
      <TeamPage />
    </>
  );
}
