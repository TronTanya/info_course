import type { ReactNode } from "react";
import { AlertCircle, ServerCrash } from "lucide-react";
import { StateShell } from "@/components/ui/state-shell";
export type ErrorCardProps = {
  className?: string;
  title: string;
  description?: string;
  /** Технический код / digest для поддержки */
  code?: string;
  action?: ReactNode;
  /** Серверная ошибка — другая иконка */
  server?: boolean;
};

/** Ошибка загрузки или действия — cyber-панель с понятным текстом. */
export function ErrorCard({ className, title, description, code, action, server }: ErrorCardProps) {
  const Icon = server ? ServerCrash : AlertCircle;

  return (
    <StateShell variant="error" terminalLine="status --error" role="alert" className={className}>
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger/12 text-danger"
          aria-hidden
        >
          <Icon className="size-7" />
        </div>
        <h3 className="typo-h3 text-balance text-foreground">{title}</h3>
        {description ? <p className="typo-body-muted mt-2 max-w-md text-pretty">{description}</p> : null}
        {code ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            ref: <span className="text-danger/90">{code}</span>
          </p>
        ) : null}
        {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
      </div>
    </StateShell>
  );
}
