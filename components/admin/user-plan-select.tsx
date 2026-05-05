"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { panelSelectClass } from "@/components/ui/form-field-styles";
import type { AdminActionState } from "@/modules/admin/actions";

const initialState: AdminActionState = {};

type UserPlanSelectProps = {
  userId: string;
  currentPlan: "free" | "pro" | "business";
  action: (
    prevState: AdminActionState | undefined,
    formData: FormData
  ) => Promise<AdminActionState>;
};

export function UserPlanSelect({ userId, currentPlan, action }: UserPlanSelectProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex min-w-[13rem] items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select name="plan" defaultValue={currentPlan} className={panelSelectClass}>
        <option value="free">free</option>
        <option value="pro">pro</option>
        <option value="business">business</option>
      </select>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "..." : "Guardar"}
      </Button>
      <FormMessage message={state.message} tone="success" className="text-xs" />
    </form>
  );
}
