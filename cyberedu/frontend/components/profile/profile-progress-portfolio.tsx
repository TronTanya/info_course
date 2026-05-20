import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { buildProfileSkillsMap } from "@/lib/profile-portfolio";
import {
  buildProfileQuickActions,
  buildProfileWeakTopics,
} from "@/lib/profile-ui";
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
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";

export type ProfileProgressPortfolioProps = {
  stats: ProfileCourseStats;
  achievements: AchievementRow[];
  modules: CourseProgressModuleRow[];
};

export function ProfileProgressPortfolio({ stats, achievements, modules }: ProfileProgressPortfolioProps) {
  const weakTopics = buildProfileWeakTopics(stats, modules);
  const quickActions = buildProfileQuickActions(stats, modules, weakTopics);
  const continueAction = quickActions.find((a) => a.id === "continue") ?? quickActions[0]!;
  const activities = buildRecentActivities(stats);
  const steps = computeStepMetrics(modules);
  const skills = buildProfileSkillsMap(modules);
  const progressTone = stats.progressPercent >= 100 ? "success" : "default";

  return (
    <div className="min-w-0 space-y-5 overflow-x-clip sm:space-y-6">
      <SectionCard variant="lab" flushTitle className="p-5 sm:p-6" aria-labelledby="profile-progress-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="typo-eyebrow text-primary">Progress overview</p>
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
          <ProgressRing
            value={stats.progressPercent}
            size={112}
            strokeWidth={9}
            tone={progressTone}
            label="Курс"
          />
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

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileTestResults stats={stats} recentTests={stats.recentTests} weakTopics={weakTopics} />
        <ProfilePracticeResults stats={stats} recentSubmissions={stats.recentSubmissions} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileCompletedModules modules={stats.completedModuleRows} />
        <SectionCard variant="default" flushTitle className="overflow-hidden p-0" id="achievements">
          <ProfileAchievementsPanel rows={achievements} />
        </SectionCard>
      </div>

      <ProfileCertificateProgress stats={stats} modules={modules} />

      <ProfileActivitySection stats={stats} activities={activities} continueAction={continueAction} />
    </div>
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
    <div className="rounded-xl border border-border/70 bg-muted/20 px-2 py-2.5 text-center">
      <Icon className="mx-auto size-4 text-primary" aria-hidden />
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{total > 0 ? `${done}/${total}` : "—"}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
