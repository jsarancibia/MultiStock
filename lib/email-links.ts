/**
 * Genera un enlace directo a Gmail web con destinatario, asunto y cuerpo pre-escritos.
 * Funciona en cualquier navegador sin necesidad de cliente de correo instalado.
 * Si el usuario tiene sesión en Gmail, se abre la ventana de redacción.
 */
export function gmailLink(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL ?? "multistock.dev@gmail.com";
