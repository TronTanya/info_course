import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileMetaTile({
  icon: Icon,
  label,
  value,
  wide = false,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  /** На узких экранах — на всю ширину сетки (учебное заведение и длинные строки). */
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ce-profile-meta-tile ce-glass min-w-0 rounded-xl border border-border/60 p-3 sm:p-4",
        wide && "sm:col-span-2",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="typo-label leading-snug">{label}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-pretty break-words text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
