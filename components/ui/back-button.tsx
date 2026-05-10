"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
  href: string;
  label?: string;
};

export function BackButton({ href, label = "Volver" }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button variant="ghost" size="sm" className="-ml-2 gap-1">
        <ArrowLeft className="size-4" aria-hidden />
        {label}
      </Button>
    </Link>
  );
}
