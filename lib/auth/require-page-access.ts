import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { getBusinessRole, type BusinessRole } from "@/lib/auth/require-business-role";

/**
 * Protege páginas completas (Server Components) por rol.
 * Si el usuario no tiene un rol permitido, redirige al dashboard.
 * A diferencia de requireBusinessRole(), esto NO lanza error, sino que redirige.
 */
export async function requirePageAccess(allowedRoles: BusinessRole[]) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const role = await getBusinessRole(user.id, business.id);

  if (!role || !allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return { user, business, role };
}
