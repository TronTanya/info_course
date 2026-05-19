"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { LearningJourneyStepId } from "@/lib/learning-journey";
import { journeyStepIndex } from "@/lib/learning-journey";
import { cn } from "@/lib/utils";

const STEPS: {
  id: LearningJourneyStepId;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { id: "register", label: "Регистрация", shortLabel: "Старт", href: "/auth/register", icon: UserPlus },
  { id: "course", label: "Курс", shortLabel: "Курс", href: "/dashboard/course", icon: BookOpen },
  { id: "lesson", label: "Урок", shortLabel: "Урок", href: "/dashboard/course", icon: GraduationCap },
  { id: "test", label: "Тест", shortLabel: "Тест", href: "/dashboard/course", icon: ClipboardList },
  { id: "practice", label: "Практика", shortLabel: "Практика", href: "/dashboard/course", icon: FlaskConical },
  { id: "certificate", label: "Сертификат", shortLabel: "Сертификат", href: "/dashboard/certificate", icon: Award },
];

export function LearningJourneyStrip({
  current,
  className,
  compact,
}: {
  current: LearningJourneyStepId;
  className?: string;
  compact?: boolean;
}) {
  const currentIdx = journeyStepIndex(current);

  return (
    <nav
      className={cn(
        "ce-surface-card ce-scroll-x-contained px-3 py-3 sm:px-4 sm:py-4",
        className,
      )}
      aria-label="Путь обучения"
    >
      <ol className="flex min-w-max list-none items-center gap-1 p-0 sm:gap-2">
        {STEPS.map((step, index) => {
          const done = index < currentIdx;
          const active = step.id === current;
          const Icon = step.icon;
          const label = compact ? step.shortLabel : step.label;

          return (
            <li key={step.id} className="flex items-center gap-1 sm:gap-2">
              {index > 0 ? (
                <span
                  className={cn(
                    "hidden h-px w-3 shrink-0 sm:block sm:w-5",
                    done ? "bg-primary/50" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
              <Link
                href={step.href}
                className={cn(
                  "flex min-h-11 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors sm:gap-2 sm:px-3 sm:py-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active &&
                    "border-primary/40 bg-primary/12 text-primary shadow-sm",
                  done &&
                    !active &&
                    "border-border/60 bg-muted/40 text-foreground hover:border-primary/25 hover:text-primary",
                  !active &&
                    !done &&
                    "border-transparent bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                <Icon className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
