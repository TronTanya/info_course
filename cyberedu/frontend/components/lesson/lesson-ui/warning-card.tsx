import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type WarningCardProps = {
  title: string;
  children: ReactNode;
  security?: boolean;
  className?: string;
};

export function WarningCard({ title, children, security = false, className }: WarningCardProps) {
  return (
    <section
      role="alert"
      className={cn(
        "rounded-2xl border border-warning/35 bg-warning/10 px-5 py-4 shadow-sm ring-1 ring-inset ring-warning/20",
        security && "border-danger/35 bg-danger/10 ring-danger/20",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl border",
            security ? "border-danger/30 bg-danger/15 text-danger" : "border-warning/30 bg-warning/15 text-warning",
          )}
        >
          <ShieldAlert className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-mono text-[10px] font-semibold uppercase tracking-widest",
              security ? "text-danger" : "text-warning",
            )}
          >
            {security ? "Security Warning" : "Внимание"}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-snug text-foreground">{title}</h3>
          <div className="mt-2 text-[15px] leading-relaxed text-foreground/90">{children}</div>
        </div>
      </div>
    </section>
  );
}
