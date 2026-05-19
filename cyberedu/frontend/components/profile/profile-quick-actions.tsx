import Link from "next/link";
import { Award, BookOpen, Target } from "lucide-react";
import type { ProfileQuickAction } from "@/lib/profile-ui";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

const ICONS = {
  continue: BookOpen,
  certificate: Award,
  weak: Target,
} as const;

export function ProfileQuickActions({ actions }: { actions: ProfileQuickAction[] }) {
  return (
    <SectionCard variant="lab" flushTitle className="p-4 sm:p-5" aria-labelledby="profile-actions-heading">
      <h2 id="profile-actions-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
        Быстрые действия
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Продолжайте учиться или закрепите слабые места.</p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = ICONS[action.id];
          const content = (
            <>
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
                  action.id === "certificate"
                    ? "bg-primary/12 text-primary ring-primary/25"
                    : action.id === "weak"
                      ? "bg-warning/10 text-warning ring-warning/25"
                      : "bg-cyan/10 text-cyan ring-cyan/25",
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block font-semibold text-foreground">{action.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {action.description}
                </span>
              </span>
            </>
          );

          if (action.disabled) {
            return (
              <li key={action.id}>
                <div
                  className="flex min-h-[5.5rem] gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 opacity-70"
                  aria-disabled="true"
                >
                  {content}
                </div>
              </li>
            );
          }

          return (
            <li key={action.id}>
              <Link
                href={action.href}
                className={cn(
                  "flex min-h-[4.75rem] gap-3 rounded-xl border border-border/80 bg-card/60 p-4 transition-colors sm:min-h-[5.5rem]",
                  "hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
