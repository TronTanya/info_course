import { cn } from "@/lib/utils";

export type AuthStatusStep = {
  title: string;
  description?: string;
  done?: boolean;
};

export function AuthStatusSteps({
  steps,
  className,
}: {
  steps: AuthStatusStep[];
  className?: string;
}) {
  return (
    <ol className={cn("space-y-3", className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-3">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
              step.done
                ? "border-success/40 bg-success/12 text-success"
                : "border-border bg-muted/40 text-muted-foreground",
            )}
            aria-hidden
          >
            {step.done ? "✓" : index + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-medium text-foreground">{step.title}</p>
            {step.description ? (
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
