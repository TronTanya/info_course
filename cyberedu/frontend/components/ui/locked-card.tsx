import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { StateShell } from "@/components/ui/state-shell";
import { cn } from "@/lib/utils";

export type LockedCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Если переданы children — карточка-оверлей поверх контента */
  locked?: boolean;
  children?: ReactNode;
};

/**
 * Заблокированный модуль или шаг: standalone-панель или оверлей поверх превью.
 */
export function LockedCard({
  title,
  description,
  action,
  className,
  locked = true,
  children,
}: LockedCardProps) {
  if (children) {
    return (
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "transition-opacity duration-200",
            locked && "pointer-events-none select-none opacity-45 blur-[0.3px]",
          )}
          aria-hidden={locked}
        >
          {children}
        </div>
        {locked ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/55 p-4 backdrop-blur-0.5">
            <LockedCardPanel title={title} description={description} action={action} className="max-w-sm w-full shadow-2xl" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <LockedCardPanel
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

function LockedCardPanel({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <StateShell variant="locked" terminalLine="access --denied" role="status" className={className}>
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/50 text-muted-foreground"
          aria-hidden
        >
          <Lock className="size-7" />
        </div>
        <h3 className="typo-h3 text-balance">{title}</h3>
        {description ? <p className="typo-body-muted mt-2 max-w-sm text-pretty">{description}</p> : null}
        {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
      </div>
    </StateShell>
  );
}
