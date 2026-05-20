"use client";

import Link from "next/link";
import { Award, BookOpen, ClipboardCheck, FlaskConical, User } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getQuickActionHrefs } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

export function DashboardQuickActions({
  modules,
  stats,
}: {
  modules: CourseProgressModuleRow[];
  stats: ProfileCourseStats;
}) {
  const hrefs = getQuickActionHrefs(modules, stats);

  const actions = [
    { href: hrefs.modules, label: "Курс", icon: BookOpen },
    { href: hrefs.test, label: "Тест", icon: ClipboardCheck },
    { href: hrefs.practice, label: "Практика", icon: FlaskConical },
    { href: "/dashboard/profile", label: "Профиль", icon: User },
    { href: "/dashboard/certificate", label: "Сертификат", icon: Award },
  ] as const;

  return (
    <PremiumCard variant="default" padding="md" className="min-w-0" aria-labelledby="dash-actions-heading">
      <p id="dash-actions-heading" className="typo-eyebrow text-primary">
        Quick actions
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {actions.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className={cn(
                "flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-muted/20 px-2 py-3 text-center",
                "transition-colors hover:border-primary/25 hover:bg-primary/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
              <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PremiumCard>
  );
}
