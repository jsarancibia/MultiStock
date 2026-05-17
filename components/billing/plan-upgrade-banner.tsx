import { TrendingUp, ArrowUpRight, AlertTriangle, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuotaInfo } from "@/lib/billing/get-quota";
import { getUpgradePath } from "@/lib/billing/plan-banner-config";
import type { SubscriptionPlan } from "@/config/plans";
import { gmailLink, SALES_EMAIL } from "@/lib/email-links";

type PlanUpgradeBannerProps = {
  quota: QuotaInfo;
  plan: SubscriptionPlan;
  resourceLabel: string;
  /** Ej: "productos activos", "miembros del equipo" */
  resourceUnit: string;
};

/**
 * Banner suave de upgrade que aparece cuando te acercas al límite.
 *
 * - < 80%: no se muestra
 * - ≥ 80% y < 100%: banner ámbar "estás cerca del límite"
 * - ≥ 100%: banner rojo "llegaste al límite"
 * - Enterprise o planes comercialmente ilimitados: nunca se muestra
 */
export function PlanUpgradeBanner({ quota, plan, resourceLabel, resourceUnit }: PlanUpgradeBannerProps) {
  // No mostrar si el plan es comercialmente ilimitado
  if (quota.effectivelyUnlimited) return null;
  if (!quota.limit) return null;

  const upgradePath = getUpgradePath(plan);

  // Mostrar solo si está cerca o en el límite
  if (!quota.isNearLimit && !quota.isAtLimit) return null;

  const isAtLimit = quota.isAtLimit;
  const isNearLimit = quota.isNearLimit;

  const barColor = isAtLimit
    ? "bg-red-500"
    : isNearLimit
      ? "bg-amber-500"
      : "bg-amber-400";

  const borderColor = isAtLimit
    ? "border-red-200/80 dark:border-red-900/50"
    : "border-amber-200/80 dark:border-amber-900/50";

  const bgColor = isAtLimit
    ? "bg-red-50/80 dark:bg-red-950/20"
    : "bg-amber-50/80 dark:bg-amber-950/20";

  const textColor = isAtLimit
    ? "text-red-950 dark:text-red-100"
    : "text-amber-950 dark:text-amber-100";

  const iconBg = isAtLimit
    ? "bg-red-200/70 dark:bg-red-500/20"
    : "bg-amber-200/70 dark:bg-amber-500/20";

  const iconColor = isAtLimit
    ? "text-red-950 dark:text-red-100"
    : "text-amber-950 dark:text-amber-100";

  return (
    <section
      className={cn(
        "rounded-2xl border p-5 shadow-sm",
        borderColor,
        bgColor,
        textColor
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Icono */}
        <div
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full",
            iconBg,
            iconColor
          )}
        >
          {isAtLimit ? (
            <AlertTriangle className="size-5" aria-hidden />
          ) : (
            <TrendingUp className="size-5" aria-hidden />
          )}
        </div>

        {/* Contenido principal */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Título */}
          {isAtLimit ? (
            <p className="text-sm font-semibold">
              Llegaste al límite de tu plan{" "}
              <span className="capitalize">{plan}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold">
              Te estás acercando al límite de{" "}
              {resourceLabel.toLowerCase()}
            </p>
          )}

          {/* Barra de progreso */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span>
                {quota.current} de {quota.limit} {resourceUnit}
              </span>
              <span className="font-medium">{quota.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className={cn("h-full rounded-full transition-all duration-500", barColor)}
                style={{ width: `${Math.min(quota.percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Próximo plan */}
          {upgradePath && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground dark:text-amber-300/70">
                Actualiza a{" "}
                <span className="font-semibold text-foreground dark:text-amber-100">
                  {upgradePath.nextPlanName}
                </span>{" "}
                por {upgradePath.nextPlanPrice} y obtén:
              </p>
              <ul className="space-y-1">
                {upgradePath.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <ArrowUpRight className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón */}
          <a
            href={gmailLink(
              SALES_EMAIL,
              `Quiero actualizar mi plan ${plan}`,
              `Hola MultiStock,\n\nQuiero actualizar mi plan ${plan} de MultiStock.\n\nDatos del negocio:\n- Nombre del negocio:\n- Rubro: (almacén / verdulería / ferretería)\n- Ciudad:\n- Cantidad aproximada de productos:\n- Cantidad de trabajadores que usarán el sistema:\n\nDatos de contacto:\n- Nombre:\n- Teléfono/WhatsApp:\n- Correo:\n\nQuedo atento(a).`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-1 inline-flex items-center gap-1.5"
            )}
          >
            <Mail className="size-3.5" />
            Actualizar plan
          </a>
        </div>
      </div>
    </section>
  );
}
