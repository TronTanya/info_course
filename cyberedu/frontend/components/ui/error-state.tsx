import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ErrorStateProps = {
  className?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function ErrorState({ className, title, description, action }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-danger/35 bg-danger/8 px-6 py-12 text-center shadow-sm",
        className,
      )}
    >
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger/12 text-danger"
        aria-hidden
      >
        <AlertCircle className="size-7" />
      </div>
      <h3 className="typo-h3 text-balance text-foreground">{title}</h3>
      {description ? <p className="typo-body-muted mt-2 max-w-md text-pretty">{description}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
