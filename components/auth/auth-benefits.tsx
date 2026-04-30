import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthBenefitsProps = {
  items: readonly string[];
  className?: string;
};

export function AuthBenefits({ items, className }: AuthBenefitsProps) {
  return (
    <ul
      className={cn(
        "space-y-2.5 text-sm text-muted-foreground",
        className
      )}
    >
      {items.map((text) => (
        <li key={text} className="flex gap-2.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Check className="size-3" aria-hidden strokeWidth={2.5} />
          </span>
          <span className="leading-snug">{text}</span>
        </li>
      ))}
    </ul>
  );
}
