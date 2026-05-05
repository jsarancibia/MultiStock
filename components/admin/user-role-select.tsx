"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { panelSelectClass } from "@/components/ui/form-field-styles";
import type { AdminActionState } from "@/modules/admin/actions";

const initialState: AdminActionState = {};

type UserRoleSelectProps = {
  userId: string;
  currentRole: "admin" | "user";
  action: (
    prevState: AdminActionState | undefined,
    formData: FormData
  ) => Promise<AdminActionState>;
};

export function UserRoleSelect({ userId, currentRole, action }: UserRoleSelectProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex min-w-[12rem] items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select name="role" defaultValue={currentRole} className={panelSelectClass}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "..." : "Guardar"}
      </Button>
      <FormMessage message={state.message} tone="info" className="text-xs" />
    </form>
  );
}
