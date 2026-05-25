import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { StudentPageHeader } from "@/components/layout/student-page-header";
import { Button } from "@/components/ui/button";
import { getLeaderboard } from "@/lib/leaderboard";
import { getCurrentUser } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Рейтинг",
};

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user?.profile) {
    redirect("/auth/login");
  }

  const rows = await getLeaderboard();
  const myRow = rows.find((r) => r.userId === user.id);

  return (
    <DashboardShell stack="loose">
      <LearnPageWrap>
        <StudentPageHeader
          eyebrow="Соревнование"
          title="Турнирная таблица"
          description="Рейтинг студентов по прогрессу курса, баллам и трофеям. Нажмите на имя — откроется профиль с модулем и достижениями."
          backHref="/dashboard"
          backLabel="← Кабинет"
        />

        {myRow ? (
          <p className="rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm text-foreground">
            Ваше место: <strong className="tabular-nums">#{myRow.rank}</strong> · {myRow.progressPercent}% курса ·{" "}
            {myRow.achievementsUnlocked} трофеев
            {myRow.currentModuleTitle ? (
              <>
                {" "}
                · сейчас: <span className="font-medium">{myRow.currentModuleTitle}</span>
              </>
            ) : null}
          </p>
        ) : null}

        <LeaderboardTable rows={rows} currentUserId={user.id} />

        <div className="flex justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/profile">Мой профиль</Link>
          </Button>
        </div>
      </LearnPageWrap>
    </DashboardShell>
  );
}
