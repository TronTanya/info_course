import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { StateShell } from "@/components/ui/state-shell";
import { cn } from "@/lib/utils";

export type SuccessStateProps = {
  className?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function SuccessState({ className, title, description, action, compact }: SuccessStateProps) {
  return (
    <StateShell variant="success" terminalLine="status --ok" role="status" className={className}>
      <div className={cn("flex flex-col items-center text-center", compact ? "px-5 py-8" : "px-6 py-12")}>
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-success/35 bg-success/12 text-success"
          aria-hidden
        >
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="typo-h3 text-balance text-foreground">{title}</h3>
        {description ? <p className="typo-body-muted mt-2 max-w-md text-pretty">{description}</p> : null}
        {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
      </div>
    </StateShell>
  );
}
