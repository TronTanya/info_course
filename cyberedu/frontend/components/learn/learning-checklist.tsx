import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistItem = { text: string; checked: boolean };

export function LearningChecklist({ items, className }: { items: ChecklistItem[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "max-w-prose space-y-2 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 ring-1 ring-inset ring-border/40",
        className,
      )}
      aria-label="Чеклист"
    >
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-base leading-relaxed">
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
              item.checked
                ? "border-success/40 bg-success/15 text-success"
                : "border-border bg-card text-transparent",
            )}
            aria-hidden
          >
            {item.checked ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
          </span>
          <span className={cn("text-foreground/90", item.checked && "text-muted-foreground line-through")}>
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
