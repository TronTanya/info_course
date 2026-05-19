import { Loader2 } from "lucide-react";
import { StateShell } from "@/components/ui/state-shell";
import { cn } from "@/lib/utils";

export type LoadingStateProps = {
  className?: string;
  label?: string;
  size?: "default" | "sm";
  terminalLine?: string;
};

export function LoadingState({
  className,
  label = "Загрузка…",
  size = "default",
  terminalLine = "status --loading",
}: LoadingStateProps) {
  return (
    <StateShell variant="loading" terminalLine={terminalLine} role="status" className={className}>
      <div
        aria-live="polite"
        aria-busy="true"
        className={cn(
          "flex flex-col items-center justify-center text-center",
          size === "sm" ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
        )}
      >
        <Loader2
          className={cn("animate-spin text-primary", size === "sm" ? "size-6" : "size-9")}
          aria-hidden
        />
        <p className={cn("text-muted-foreground", size === "sm" ? "text-sm" : "text-base")}>{label}</p>
      </div>
    </StateShell>
  );
}
