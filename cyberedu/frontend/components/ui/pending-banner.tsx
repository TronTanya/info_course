import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PendingBanner({
  label = "Отправка…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-foreground",
        className,
      )}
    >
      <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
