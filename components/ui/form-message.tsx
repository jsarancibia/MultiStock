import { cn } from "@/lib/utils";

type FormMessageProps = {
  message?: string | null;
  tone?: "error" | "success" | "info";
  className?: string;
};

export function FormMessage({ message, tone = "error", className }: FormMessageProps) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "text-sm",
        tone === "error" && "text-destructive",
        tone === "success" && "text-emerald-600 dark:text-emerald-400",
        tone === "info" && "text-muted-foreground",
        className
      )}
    >
      {message}
    </p>
  );
}
