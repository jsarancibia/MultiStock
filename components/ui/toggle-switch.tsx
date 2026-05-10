"use client";

type ToggleSwitchProps = {
  name: string;
  label: string;
  helpText?: string;
  defaultChecked?: boolean;
};

export function ToggleSwitch({ name, label, helpText, defaultChecked = false }: ToggleSwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0 pr-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
      </div>
      <div className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
