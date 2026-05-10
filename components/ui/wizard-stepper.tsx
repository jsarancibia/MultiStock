"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type WizardStep = {
  id: string;
  label: string;
  description?: string;
};

type WizardStepperProps = {
  steps: WizardStep[];
  currentStep: number; // 0-based
  onStepClick?: (stepIndex: number) => void;
};

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
}: WizardStepperProps) {
  return (
    <nav aria-label="Progreso del formulario" className="w-full">
      {/* Desktop: horizontal steps */}
      <ol className="hidden items-center justify-between sm:flex">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={isClickable ? () => onStepClick(index) : undefined}
                className={cn(
                  "group flex items-center gap-2 text-left text-sm transition-colors",
                  isClickable && "cursor-pointer",
                  !isClickable && !isCurrent && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isCompleted &&
                      "bg-emerald-600 text-white",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-2 ring-ring/30",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-muted text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="flex flex-col">
                  <span
                    className={cn(
                      "text-xs font-medium leading-tight",
                      isCurrent && "text-foreground",
                      isCompleted && "text-muted-foreground",
                      !isCompleted && !isCurrent && "text-muted-foreground/60",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description ? (
                    <span className="text-[10px] leading-tight text-muted-foreground/50">
                      {step.description}
                    </span>
                  ) : null}
                </span>
              </button>
              {/* Connector line */}
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors",
                    index < currentStep
                      ? "bg-emerald-600/40"
                      : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact indicator */}
      <div className="flex items-center justify-between sm:hidden">
        <span className="text-sm font-medium text-foreground">
          {steps[currentStep]?.label}
        </span>
        <span className="text-xs text-muted-foreground">
          Paso {currentStep + 1} de {steps.length}
        </span>
      </div>
      {/* Mobile progress bar */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted sm:hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>
    </nav>
  );
}
