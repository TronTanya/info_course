import { CheckCircle2, Lock, PlayCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: PlayCircle, label: "Текущая миссия", className: "text-primary" },
  { icon: Circle, label: "Доступно", className: "text-foreground" },
  { icon: CheckCircle2, label: "Завершено", className: "text-success" },
  { icon: Lock, label: "Заблокировано", className: "text-muted-foreground" },
] as const;

export function CourseTrackLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-xs text-muted-foreground",
        className,
      )}
      aria-label="Обозначения на карте курса"
    >
      <span className="font-medium text-foreground">Легенда:</span>
      {items.map(({ icon: Icon, label, className: iconClass }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <Icon className={cn("size-3.5", iconClass)} strokeWidth={1.75} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
