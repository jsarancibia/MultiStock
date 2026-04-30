import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskItem = {
  id: string;
  label: string;
  helper?: string;
  action?: ReactNode;
};

type TaskListCardProps = {
  title: string;
  description?: string;
  items: TaskItem[];
  className?: string;
};

export function TaskListCard({ title, description, items, className }: TaskListCardProps) {
  return (
    <article className={cn("rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/35 p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 text-emerald-500" aria-hidden />
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                {item.helper ? <p className="text-xs text-muted-foreground">{item.helper}</p> : null}
              </div>
            </div>
            {item.action}
          </li>
        ))}
      </ul>
    </article>
  );
}
