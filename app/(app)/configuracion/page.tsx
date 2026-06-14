import { requireUser } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/forms/change-password-form";

export default async function ConfiguracionPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuracion</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona los ajustes de tu cuenta.
        </p>
      </div>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Cambiar contrasena</h2>
          <p className="text-sm text-muted-foreground">
            Conectado como{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>

        <ChangePasswordForm />
      </section>
    </div>
  );
}
