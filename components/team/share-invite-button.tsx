"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareInviteModal } from "@/components/team/share-invite-modal";
import { QrCode } from "lucide-react";

type Props = {
  email: string;
};

export function ShareInviteButton({ email }: Props) {
  const [open, setOpen] = useState(false);

  const registerUrl = `${window.location.origin}/auth/register`;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        title="Compartir invitación"
      >
        <QrCode className="size-4" />
      </Button>
      <ShareInviteModal
        open={open}
        onOpenChange={setOpen}
        email={email}
        registerUrl={registerUrl}
      />
    </>
  );
}
