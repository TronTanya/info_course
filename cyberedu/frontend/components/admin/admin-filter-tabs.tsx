import Link from "next/link";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export type AdminFilterTab = {
  href: string;
  label: string;
  match: string;
};

export function AdminFilterTabs({ tabs, active, className }: { tabs: AdminFilterTab[]; active: string; className?: string }) {
  return (
    <div
      className={cn(
        "ce-admin-filter-tabs flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible sm:pb-0",
        className,
      )}
      role="tablist"
      aria-label="Фильтр списка"
    >
      {tabs.map((t) => {
        const isActive = active === t.match;
        return (
          <Link
            key={t.match}
            href={t.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "shrink-0 snap-start rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all motion-reduce:transition-none sm:whitespace-normal",
              isActive
                ? "bg-primary text-primary-foreground shadow-(--shadow-card) ring-1 ring-primary/30"
                : "border border-primary/15 bg-card/90 text-foreground hover:border-primary/30 hover:bg-primary/5",
              focusRing,
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
