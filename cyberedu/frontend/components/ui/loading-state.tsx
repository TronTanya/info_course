import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingStateProps = {
  className?: string;
  label?: string;
  size?: "default" | "sm";
};

export function LoadingState({ className, label = "Загрузка…", size = "default" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" ? "gap-2 py-8" : "gap-3 py-14",
        className,
      )}
    >
      <Loader2
        className={cn("animate-spin text-primary", size === "sm" ? "size-6" : "size-9")}
        aria-hidden
      />
      <p className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>{label}</p>
    </div>
  );
}
