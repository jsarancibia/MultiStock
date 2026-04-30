import { cn } from "@/lib/utils";

type StatusRingProps = {
  value: number;
  label?: string;
  className?: string;
};

export function StatusRing({ value, label = "Estado", className }: StatusRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative size-20">
        <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
          <circle cx="40" cy="40" r="36" className="fill-none stroke-muted" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r="36"
            className="fill-none stroke-emerald-500 transition-all"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-foreground">
          {clamped}%
        </span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">
          {clamped >= 80 ? "Alto" : clamped >= 50 ? "Medio" : "Bajo"}
        </p>
      </div>
    </div>
  );
}
