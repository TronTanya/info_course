import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { DashboardActivityItem } from "@/lib/dashboard-ui";
import type { ProfileQuickAction } from "@/lib/profile-ui";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";

export function ProfileActivitySection({
  stats,
  activities,
  continueAction,
}: {
  stats: ProfileCourseStats;
  activities: DashboardActivityItem[];
  continueAction: ProfileQuickAction;
}) {
  const last = stats.lastActivitySummary;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <SectionCard variant="lab" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-continue-heading">
        <h2 id="profile-continue-heading" className="font-display text-base font-semibold text-foreground">
          Продолжить обучение
        </h2>
        {last ? (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Radio className="size-3.5 text-cyan" aria-hidden />
              {last.label}
            </span>
            <span className="mt-1 block text-pretty">{last.detail}</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Начните с карты курса — наставник и лекции ждут вас.</p>
        )}
        <Button asChild variant="primary" size="lg" className="mt-5 w-full gap-2 sm:w-auto">
          <Link href={continueAction.href}>
            {continueAction.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{continueAction.description}</p>
      </SectionCard>

      <SectionCard variant="default" flushTitle className="p-4 sm:p-6">
        {activities.length === 0 ? (
          <EmptyState
            title="Активности пока нет"
            description="Пройдите лекцию, тест или практику — события появятся в ленте."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/course">К карте курса</Link>
              </Button>
            }
          />
        ) : (
          <DashboardRecentActivity items={activities} showProfileLink={false} />
        )}
      </SectionCard>
    </div>
  );
}
