"use client";

import Link from "next/link";
import { BookOpen, Bot, FlaskConical, User } from "lucide-react";
import { openMentorChat } from "@/lib/ai/mentor-ui/open";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getQuickActionHrefs } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function DashboardQuickActions({
  modules,
  stats,
}: {
  modules: CourseProgressModuleRow[];
  stats: ProfileCourseStats;
}) {
  const hrefs = getQuickActionHrefs(modules, stats);

  const linkActions = [
    { href: hrefs.course, label: "Курс", icon: BookOpen, description: "Карта модулей" },
    { href: hrefs.practice, label: "Практики", icon: FlaskConical, description: "Лаборатории" },
    { href: hrefs.profile, label: "Профиль", icon: User, description: "Прогресс и бейджи" },
  ] as const;

  return (
    <nav className="min-w-0" aria-label="Быстрые действия">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {linkActions.map(({ href, label, icon: Icon, description }) => (
          <li key={label}>
            <Link
              href={href}
              className={cn(
                "ce-glass flex min-h-[5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 px-3 py-4 text-center",
                "transition-[border-color,box-shadow,transform] duration-200",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
              <span className="text-sm font-semibold text-foreground">{label}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{description}</span>
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => openMentorChat()}
            className={cn(
              "ce-glass flex h-full min-h-[5rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-cyan/25 bg-cyan/5 px-3 py-4 text-center",
              "transition-[border-color,box-shadow,transform] duration-200",
              "hover:-translate-y-0.5 hover:border-cyan/40 hover:shadow-[var(--shadow-glow)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <Bot className="size-5 text-cyan" strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-semibold text-foreground">AI-наставник</span>
            <span className="text-[10px] leading-tight text-muted-foreground">Подсказки без спойлеров</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
