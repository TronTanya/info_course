"use client";

import Link from "next/link";
import { Award, BookOpen, ClipboardCheck, FlaskConical, User } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getQuickActionHrefs } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import { MobileSnapRow } from "@/components/mobile";
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
    <CockpitWidget variant="default" aria-labelledby="dash-actions-heading">
      <CockpitWidgetHeader titleId="dash-actions-heading" eyebrow="Панель команд" title="Быстрые действия" />
      <MobileSnapRow>
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "ce-cockpit-quick-tile flex min-h-18 flex-col justify-center gap-2",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-semibold leading-tight text-foreground">{label}</span>
          </Link>
        ))}
      </MobileSnapRow>
      <ul className="mt-3 hidden list-none grid-cols-2 gap-3 p-0 lg:grid lg:grid-cols-4 xl:grid-cols-5">
        {actions.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className={cn(
                "ce-cockpit-quick-tile",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
              <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </CockpitWidget>
  );
}
