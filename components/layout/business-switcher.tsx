"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";
import type { ActiveBusiness } from "@/lib/business/get-active-business";
import { cn } from "@/lib/utils";

type BusinessSwitcherProps = {
  businesses: ActiveBusiness[];
  activeBusinessId: string;
  action: (
    state: { ok?: boolean } | undefined,
    formData: FormData
  ) => Promise<{ ok?: boolean } | undefined>;
};

const initialState = { ok: true };

export function BusinessSwitcher({
  businesses,
  activeBusinessId,
  action,
}: BusinessSwitcherProps) {
  const [, formAction, pending] = useActionState(action, initialState);

  if (businesses.length <= 1) return null;

  return (
    <form
      action={formAction}
      className={cn(
        "flex min-w-0 max-w-full items-center gap-1.5 rounded-xl border border-border bg-background/80 px-2 py-1 shadow-sm"
      )}
    >
      <Building2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <label htmlFor="businessId" className="sr-only">
        Negocio activo
      </label>
      <select
        id="businessId"
        name="businessId"
        defaultValue={activeBusinessId}
        disabled={pending}
        onChange={(event) => {
          const form = event.currentTarget.form;
          if (form) form.requestSubmit();
        }}
        className="max-w-[9rem] truncate rounded-md border-0 bg-transparent py-0.5 text-xs font-medium text-foreground shadow-none sm:max-w-[12rem] md:max-w-[14rem]"
      >
        {businesses.map((business) => (
          <option key={business.id} value={business.id}>
            {business.name}
          </option>
        ))}
      </select>
    </form>
  );
}
