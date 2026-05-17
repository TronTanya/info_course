"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Award, BookOpen, ClipboardList, Settings, User } from "lucide-react";
import { DashboardAchievementsPreview } from "@/components/dashboard/dashboard-achievements-preview";
import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { motionPresets } from "@/lib/design-system/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type QuickLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    href: "/dashboard/course",
    title: "Курс",
    description: "Модули, лекции, тесты и практика",
    icon: BookOpen,
    accent: "from-primary/15 to-cyan/5",
  },
  {
    href: "/dashboard/profile",
    title: "Профиль",
    description: "ФИО, интересы для AI, аватар",
    icon: User,
    accent: "from-cyan/12 to-card",
  },
  {
    href: "/dashboard/my-assignments",
    title: "Мои задания",
    description: "Статусы практических работ",
    icon: ClipboardList,
    accent: "from-secondary/10 to-card",
  },
  {
    href: "/dashboard/certificate",
    title: "Сертификат",
    description: "PDF после завершения курса",
    icon: Award,
    accent: "from-warning/10 to-card",
  },
  {
    href: "/dashboard/settings",
    title: "Настройки",
    description: "Безопасность и уведомления",
    icon: Settings,
    accent: "from-muted/80 to-card",
  },
];

export function DashboardHome({
  stats,
  displayName,
  achievements,
}: {
  stats: ProfileCourseStats | null;
  displayName: string;
  achievements: AchievementRow[];
}) {
  const continueHref = stats?.currentModuleId
    ? `/dashboard/course/${stats.currentModuleId}/lesson`
    : "/dashboard/course";

  return (
    <motion.div className="space-y-8" {...motionPresets.fadeIn}>
      <PageHeader
        eyebrow="CyberEdu · Security LMS"
        title={`Здравствуйте, ${displayName}`}
        description="Продолжайте курс, отслеживайте прогресс и используйте AI-наставника в контексте урока."
      />

      <section className="ce-dashboard-hero ce-border-beam grid gap-6 lg:grid-cols-[1fr_auto]">
        <motion.div className="space-y-4" {...motionPresets.slideUp}>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="in_progress" label="Активное обучение" />
            {stats?.allModulesComplete ? (
              <StatusBadge status="completed" label="Курс завершён" />
            ) : (
              <StatusBadge
                status="pending"
                label={`${stats?.completedModules ?? 0} / ${stats?.totalModules ?? 0} модулей`}
              />
            )}
          </div>
          {stats ? (
            <>
              <ProgressBar
                label="Прогресс курса"
                value={stats.progressPercent}
                max={100}
                tone={stats.progressPercent >= 100 ? "success" : "default"}
              />
              <p className="typo-body-muted max-w-prose">
                {stats.currentModuleTitle
                  ? `Текущий модуль: ${stats.currentModuleTitle}`
                  : "Откройте карту курса, чтобы выбрать модуль."}
              </p>
            </>
          ) : (
            <p className="typo-body-muted">Курс ещё не настроен — обратитесь к администратору.</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href={continueHref}>
                Продолжить обучение
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/course">Карта курса</Link>
            </Button>
          </div>
        </motion.div>
        {stats ? (
          <CircularProgress value={stats.progressPercent} size={128} tone="cyan" label="Прогресс курса" />
        ) : null}
      </section>

      {achievements.length > 0 ? <DashboardAchievementsPreview rows={achievements} /> : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Баллы" value={stats.totalPoints} hint={`из ${stats.maxPossiblePoints} возможных`} />
          <MetricCard label="Успешность" value={`${stats.scoreSuccessPercent}%`} hint="Авто-оценка" />
          <MetricCard label="Модули" value={`${stats.completedModules}/${stats.totalModules}`} hint="Завершено" />
          <MetricCard label="Достижения" value={`${achievements.filter((a) => a.unlocked).length}/${achievements.length}`} hint="Бейджи в профиле" />
        </div>
      ) : null}

      <div className="responsive-card-grid">
        {QUICK_LINKS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * motionPresets.stagger, duration: 0.25 }}
            >
              <Card
                className={cn(
                  "group relative h-full overflow-hidden border-border/70 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover motion-reduce:hover:translate-y-0",
                )}
              >
                <div
                  className={cn("pointer-events-none absolute inset-0 bg-linear-to-br opacity-70", item.accent)}
                  aria-hidden
                />
                <CardHeader className="relative">
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-card/90 text-primary ring-1 ring-border">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    href={item.href}
                  >
                    Открыть
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
