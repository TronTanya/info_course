"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { buildProfileSkillsMap } from "@/lib/profile-portfolio";
import { buildProfileQuickActions, buildProfileWeakTopics } from "@/lib/profile-ui";
import { buildRecentActivities, computeStepMetrics } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { ProfileAchievementsPanel } from "@/components/achievements/profile-achievements-panel";
import { ProfileActivitySection } from "@/components/profile/profile-activity-section";
import { ProfileCertificateProgress } from "@/components/profile/profile-certificate-progress";
import { ProfileCompletedModules } from "@/components/profile/profile-completed-modules";
import { ProfilePracticeResults } from "@/components/profile/profile-practice-results";
import { ProfileSkillsMap } from "@/components/profile/profile-skills-map";
import { ProfileTestResults } from "@/components/profile/profile-test-results";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";

const TAB_VALUES = ["overview", "results", "achievements", "certificate"] as const;
type ProfileTab = (typeof TAB_VALUES)[number];

function isProfileTab(value: string | null): value is ProfileTab {
  return value != null && (TAB_VALUES as readonly string[]).includes(value);
}

export type ProfileProgressPortfolioProps = {
  stats: ProfileCourseStats;
  achievements: AchievementRow[];
  modules: CourseProgressModuleRow[];
  initialTab?: string | null;
};

export function ProfileProgressPortfolio({
  stats,
  achievements,
  modules,
  initialTab,
}: ProfileProgressPortfolioProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/dashboard/profile";
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? initialTab ?? "overview";
  const activeTab: ProfileTab = isProfileTab(tabParam) ? tabParam : "overview";

  const setTab = useCallback(
    (next: ProfileTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash !== "#achievements-heading") return;
    setTab("achievements");
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "achievements");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, setTab]);

  const weakTopics = buildProfileWeakTopics(stats, modules);
  const quickActions = buildProfileQuickActions(stats, modules, weakTopics);
  const continueAction = quickActions.find((a) => a.id === "continue") ?? quickActions[0]!;
  const activities = buildRecentActivities(stats);
  const steps = computeStepMetrics(modules);
  const skills = buildProfileSkillsMap(modules);
  const progressTone = stats.progressPercent >= 100 ? "success" : "default";

  return (
    <Tabs value={activeTab} onValueChange={(v) => setTab(v as ProfileTab)} className="min-w-0 space-y-4">
      <TabsList className="ce-profile-tabs ce-scroll-x-contained w-full max-w-full flex-nowrap justify-start overflow-x-auto">
        <TabsTrigger value="overview" className="shrink-0">
          Обзор
        </TabsTrigger>
        <TabsTrigger value="results" className="shrink-0">
          Тесты и практика
        </TabsTrigger>
        <TabsTrigger value="achievements" className="shrink-0">
          Достижения
        </TabsTrigger>
        <TabsTrigger value="certificate" className="shrink-0">
          Сертификат
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0 space-y-5 sm:space-y-6">
        <SectionCard variant="lab" flushTitle className="p-5 sm:p-6" aria-labelledby="profile-progress-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="typo-eyebrow text-primary">Обзор прогресса</p>
              <h2 id="profile-progress-heading" className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">
                {stats.courseTitle}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Завершено {stats.completedModules} из {stats.totalModules} модулей · {stats.totalPoints} баллов
                {stats.maxPossiblePoints > 0 ? ` из ${stats.maxPossiblePoints}` : ""}
              </p>
            </div>
            <Badge variant={stats.allModulesComplete ? "success" : "secondary"} className="shrink-0">
              {stats.allModulesComplete ? "Курс пройден" : `${stats.progressPercent}%`}
            </Badge>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={stats.progressPercent} size={112} strokeWidth={9} tone={progressTone} label="Курс" />
            <div className="min-w-0 flex-1">
              <ProgressBar label="Прогресс по модулям" value={stats.progressPercent} max={100} tone={progressTone} />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-border/60 pt-5">
            <StepChip icon={BookOpen} done={steps.lessonsDone} total={steps.lessonsTotal} label="Уроки" />
            <StepChip icon={ClipboardCheck} done={steps.testsDone} total={steps.testsTotal} label="Тесты" />
            <StepChip icon={FlaskConical} done={steps.practiceDone} total={steps.practiceTotal} label="Практики" />
          </dl>
        </SectionCard>

        <ProfileSkillsMap skills={skills} />

        <p className="text-center text-sm text-muted-foreground">
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setTab("results")}
          >
            Все результаты тестов и практики
          </button>
        </p>
      </TabsContent>

      <TabsContent value="results" className="mt-0 space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <ProfileTestResults stats={stats} recentTests={stats.recentTests} weakTopics={weakTopics} />
          <ProfilePracticeResults stats={stats} recentSubmissions={stats.recentSubmissions} />
        </div>
      </TabsContent>

      <TabsContent value="achievements" className="mt-0 space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <ProfileCompletedModules modules={stats.completedModuleRows} />
          <SectionCard variant="default" flushTitle className="overflow-hidden p-0">
            <ProfileAchievementsPanel rows={achievements} />
          </SectionCard>
        </div>
      </TabsContent>

      <TabsContent value="certificate" className="mt-0 space-y-5 sm:space-y-6">
        <ProfileCertificateProgress stats={stats} modules={modules} />
        <ProfileActivitySection stats={stats} activities={activities} continueAction={continueAction} />
      </TabsContent>
    </Tabs>
  );
}

function StepChip({
  icon: Icon,
  done,
  total,
  label,
}: {
  icon: typeof BookOpen;
  done: number;
  total: number;
  label: string;
}) {
  return (
    <div className="ce-polish-inset px-2 py-2.5 text-center">
      <Icon className="mx-auto size-4 text-primary" aria-hidden />
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{total > 0 ? `${done}/${total}` : "—"}</p>
      <p className="text-2.5 uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
