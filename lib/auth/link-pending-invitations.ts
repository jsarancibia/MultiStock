import "server-only";

import { createServiceClient } from "@/lib/supabase/server";

type LinkPendingInvitationsInput = {
  userId?: string;
  email?: string;
};

export async function linkPendingInvitationsForUser({
  userId,
  email,
}: LinkPendingInvitationsInput) {
  try {
    const supabase = createServiceClient();
    let profileId = userId;
    let normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail && profileId) {
      const { data: profileById, error } = await supabase
        .from("profiles")
        .select("id,email")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error("linkPendingInvitationsForUser (profile by id):", error.message);
        return false;
      }

      normalizedEmail = profileById?.email?.trim().toLowerCase();
    }

    if (!normalizedEmail) return false;

    if (!profileId) {
      const { data: profileByEmail, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error("linkPendingInvitationsForUser (profile by email):", error.message);
        return false;
      }

      profileId = profileByEmail?.id;
    }

    if (!profileId) return false;

    const { data: pendingInvites, error: pendingError } = await supabase
      .from("pending_invitations")
      .select("business_id")
      .eq("email", normalizedEmail);

    if (pendingError) {
      console.error("linkPendingInvitationsForUser (pending_invitations):", pendingError.message);
      return false;
    }

    if (!pendingInvites || pendingInvites.length === 0) return false;

    let linkedAny = false;

    for (const invite of pendingInvites) {
      const { error: linkError } = await supabase.from("business_users").upsert(
        {
          business_id: invite.business_id,
          user_id: profileId,
          role: "employee",
        },
        { onConflict: "business_id,user_id", ignoreDuplicates: true }
      );

      if (linkError) {
        console.error("linkPendingInvitationsForUser (business_users upsert):", linkError.message);
        continue;
      }

      linkedAny = true;
    }

    if (linkedAny) {
      await supabase
        .from("pending_invitations")
        .delete()
        .eq("email", normalizedEmail);
    }

    return linkedAny;
  } catch (error) {
    console.error("linkPendingInvitationsForUser:", error);
    return false;
  }
}
