import type { ReactNode } from "react";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { cn } from "@/lib/utils";

/** Обёртка LabTerminal для практики (единая SOC-палитра с лендингом). */
export function PracticeLabTerminal({
  title = "lab@cyberedu",
  children,
  className,
  mono = true,
  showPrompt = true,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  mono?: boolean;
  showPrompt?: boolean;
}) {
  return (
    <LabTerminal title={title} chrome className={className}>
      <div className={cn("relative", mono && "font-mono text-[13px] leading-relaxed")}>
        {showPrompt ? (
          <span className="ce-terminal-prompt pointer-events-none absolute left-0 top-0 select-none" aria-hidden>
            $
          </span>
        ) : null}
        <div className={cn(showPrompt && "pl-4")}>{children}</div>
      </div>
    </LabTerminal>
  );
}
