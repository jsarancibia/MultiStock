import { requirePageAccess } from "@/lib/auth/require-page-access";
import { TeamPage } from "@/components/team/team-page";

export default async function Page() {
  await requirePageAccess(["owner"]);
  return <TeamPage />;
}
