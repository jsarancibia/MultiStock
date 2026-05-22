import "server-only";

import { createClient, createServiceClient } from "@/lib/supabase/server";

type LinkPendingInvitationsInput = {
  userId?: string;
  email?: string;
};

export async function linkPendingInvitationsForUser({
  userId,
  email,
}: LinkPendingInvitationsInput) {
  try {
    // Preferimos service client (bypass RLS total).
    // Si no está configurado, usamos el cliente autenticado con RLS policies.
    let supabase: Awaited<ReturnType<typeof createClient>>;
    let useServiceRole = false;
    try {
      const serviceClient = createServiceClient();
      // Verificamos que funcione haciendo un ping simple
      supabase = serviceClient as unknown as Awaited<ReturnType<typeof createClient>>;
      useServiceRole = true;
    } catch {
      supabase = await createClient();
    }

    let profileId = userId;
    let normalizedEmail = email?.trim().toLowerCase();

    // Si no tenemos email, lo buscamos por userId
    if (!normalizedEmail && profileId) {
      let client;
      try {
        client = createServiceClient() as unknown as Awaited<ReturnType<typeof createClient>>;
      } catch {
        client = await createClient();
      }
      const { data: profileById } = await client
        .from("profiles")
        .select("id,email")
        .eq("id", profileId)
        .maybeSingle();

      normalizedEmail = profileById?.email?.trim().toLowerCase();
    }

    if (!normalizedEmail) return false;

    // Si no tenemos userId, lo buscamos por email (usando service para evitar RLS)
    if (!profileId) {
      let client;
      try {
        client = createServiceClient() as unknown as Awaited<ReturnType<typeof createClient>>;
      } catch {
        client = await createClient();
      }
      const { data: profileByEmail } = await client
        .from("profiles")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      profileId = profileByEmail?.id;
    }

    if (!profileId) return false;

    // Leer pending_invitations — siempre con service role si está disponible
    let readerClient;
    try {
      readerClient = createServiceClient() as unknown as Awaited<ReturnType<typeof createClient>>;
    } catch {
      readerClient = await createClient();
    }

    const { data: pendingInvites, error: pendingError } = await readerClient
      .from("pending_invitations")
      .select("business_id")
      .ilike("email", normalizedEmail);

    if (pendingError) {
      console.error("linkPendingInvitationsForUser (pending_invitations):", pendingError.message);
      return false;
    }

    if (!pendingInvites || pendingInvites.length === 0) return false;

    let linkedAny = false;

    // Para el INSERT en business_users usamos el cliente con sesión del usuario
    // porque tenemos una RLS policy que permite insertar si tiene pending_invitation.
    // Si tenemos service role, también funciona sin la policy.
    const writerClient = useServiceRole ? supabase : await createClient();

    for (const invite of pendingInvites) {
      const { error: linkError } = await writerClient.from("business_users").upsert(
        {
          business_id: invite.business_id,
          user_id: profileId,
          role: "employee",
        },
        { onConflict: "business_id,user_id", ignoreDuplicates: true }
      );

      if (linkError) {
        console.error(
          "linkPendingInvitationsForUser (business_users upsert):",
          linkError.message,
          "service_role:", useServiceRole
        );
        continue;
      }

      linkedAny = true;
    }

    if (linkedAny) {
      // DELETE también puede hacerlo el cliente autenticado con la nueva policy
      const deleterClient = useServiceRole ? supabase : await createClient();
      const { error: delError } = await deleterClient
        .from("pending_invitations")
        .delete()
        .ilike("email", normalizedEmail);

      if (delError) {
        console.error("linkPendingInvitationsForUser (delete pending):", delError.message);
      }
    }

    return linkedAny;
  } catch (error) {
    console.error("linkPendingInvitationsForUser (unexpected):", error);
    return false;
  }
}
