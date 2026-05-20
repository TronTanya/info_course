import * as React from "react";
import { cn } from "@/lib/utils";

export type LabTerminalProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  chrome?: boolean;
  glow?: boolean;
};

/** Панель в стиле терминала / SOC-консоли */
export function LabTerminal({
  className,
  title = "cyberedu@lab",
  chrome = true,
  glow = false,
  children,
  ...props
}: LabTerminalProps) {
  return (
    <div className={cn("ce-terminal overflow-hidden rounded-2xl text-sm", className)} {...props}>
      {chrome ? (
        <div className="ce-terminal-chrome flex items-center gap-2 border-b px-3 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="ce-terminal-dot-red size-2.5 rounded-full" />
            <span className="ce-terminal-dot-amber size-2.5 rounded-full" />
            <span className="ce-terminal-dot-green size-2.5 rounded-full" />
          </span>
          {title ? (
            <span className="ce-terminal-dim ml-1 min-w-0 truncate font-mono text-[11px]">{title}</span>
          ) : null}
          <span className="ce-terminal-live ml-auto font-mono text-[10px] font-semibold uppercase tracking-widest">
            live
          </span>
        </div>
      ) : null}
      <div className="ce-terminal-body min-w-0 overflow-x-auto p-4 sm:p-5">{children}</div>
    </div>
  );
}