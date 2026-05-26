import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { ProfileProgressPortfolio } from "@/components/profile/profile-progress-portfolio";
import { ProfileUserCard } from "@/components/profile/profile-user-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfilePageSkeleton } from "@/components/ui/page-skeleton";
import { AchievementUnlockToasts } from "@/components/achievements/achievement-unlock-toasts";
import { achievementNoticesFromKinds, getUserAchievementRows, reconcileUserAchievements } from "@/lib/achievements";
import { getProfileCourseStats } from "@/lib/profile-course-stats";
import { getCurrentUser } from "@/lib/permissions";
import { syncAndGetUserCourseProgress } from "@/lib/progress";

export const metadata: Metadata = {
  title: "Профиль",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.profile) {
    redirect("/auth/login");
  }

  const sp = await searchParams;
  const saved = sp.saved === "1";
  const initialTab = sp.tab ?? null;

  const p = user.profile;
  const newUnlocks = await reconcileUserAchievements(user.id);
  const achievementUnlocks = achievementNoticesFromKinds(newUnlocks);
  const [stats, achievements] = await Promise.all([
    getProfileCourseStats(user.id),
    getUserAchievementRows(user.id),
  ]);
  const progress =
    stats?.courseId != null ? await syncAndGetUserCourseProgress(user.id, stats.courseId) : null;
  const modules = progress?.modules ?? [];

  const initialsSource = `${p.firstName}${p.lastName}`.replace(/[—\s]/g, "");
  const initials =
    initialsSource.length >= 2
      ? `${initialsSource[0] ?? ""}${initialsSource[1] ?? ""}`.toUpperCase()
      : (p.firstName?.[0] ?? "?").toUpperCase();

  const fullName = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim() || "—";

  const memberSince = new Date(user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const learningStartedAt = memberSince;
  const achievementsUnlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <DashboardShell stack="loose">
      <LearnPageWrap>
        <AchievementUnlockToasts unlocks={achievementUnlocks} />
        {saved ? (
          <Alert variant="success" title="Профиль сохранён">
            Изменения записаны. Данные учтены для сертификата и AI-адаптации лекций.
          </Alert>
        ) : null}

        <ProfileUserCard
          fullName={fullName}
          email={user.email}
          role={user.role}
          memberSince={memberSince}
          learningStartedAt={learningStartedAt}
          avatarUrl={p.avatarUrl}
          initials={initials}
          educationalInstitution={p.educationalInstitution}
          specialty={p.specialty}
          city={p.city}
          stats={stats}
          achievementsUnlocked={achievementsUnlocked}
          achievementsTotal={achievements.length}
        />

        {!stats ? (
          <EmptyState
            terminalLine="profile --no-course"
            title="Прогресс курса пока недоступен"
            description="Когда администратор подключит программу, здесь появится портфолио: модули, тесты, практики и сертификат."
            action={
              <Button asChild variant="primary">
                <Link href="/dashboard">В кабинет</Link>
              </Button>
            }
          />
        ) : (
          <Suspense fallback={<ProfilePageSkeleton />}>
            <ProfileProgressPortfolio
              stats={stats}
              achievements={achievements}
              modules={modules}
              initialTab={initialTab}
            />
          </Suspense>
        )}
      </LearnPageWrap>
    </DashboardShell>
  );
}
