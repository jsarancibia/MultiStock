const DEFAULT_MESSAGE = "No pudimos completar la acción. Intenta nuevamente.";

export function humanizeActionError(raw: unknown, fallback: string = DEFAULT_MESSAGE): string {
  const message = typeof raw === "string" ? raw : "";
  if (!message.trim()) return fallback;

  const m = message.toLowerCase();
  if (m.includes("network") || m.includes("fetch")) {
    return "Error de red. Revisa tu conexión e intenta de nuevo.";
  }
  if (m.includes("permission") || m.includes("policy")) {
    return "No tienes permisos para esta operación en el negocio activo.";
  }
  if (m.includes("duplicate") || m.includes("unique")) {
    return "Ya existe un registro con esos datos.";
  }
  return message;
}
