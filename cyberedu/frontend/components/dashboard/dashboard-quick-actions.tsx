"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical, Sparkles } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getQuickActionHrefs } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { key: "modules" as const, label: "Модули", icon: BookOpen },
  { key: "practice" as const, label: "Практика", icon: FlaskConical },
  { key: "test" as const, label: "Тесты", icon: ClipboardCheck },
  { key: "mentor" as const, label: "AI-наставник", icon: Sparkles },
] as const;

export function DashboardQuickActions({
  modules,
  stats,
}: {
  modules: CourseProgressModuleRow[];
  stats: ProfileCourseStats;
}) {
  const hrefs = getQuickActionHrefs(modules, stats);

  return (
    <SectionCard variant="default" flushTitle className="p-5 sm:p-6" aria-labelledby="dash-actions-heading">
      <p id="dash-actions-heading" className="typo-eyebrow text-primary">
        Быстрые действия
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={hrefs[key]}
            className={cn(
              "flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-muted/20 px-2 py-3 text-center",
              "transition-colors hover:border-primary/25 hover:bg-primary/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              key === "mentor" && "border-cyan/20 hover:border-cyan/30 hover:bg-cyan/5",
            )}
          >
            <Icon
              className={cn("size-5", key === "mentor" ? "text-cyan" : "text-primary")}
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
