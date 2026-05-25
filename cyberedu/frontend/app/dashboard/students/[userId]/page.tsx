import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { StudentPageHeader } from "@/components/layout/student-page-header";
import { PublicStudentProfileView } from "@/components/profile/public-student-profile-view";
import { Button } from "@/components/ui/button";
import { getPublicStudentProfile } from "@/lib/public-student-profile";
import { getCurrentUser } from "@/lib/permissions";

type PageProps = { params: Promise<{ userId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const viewer = await getCurrentUser();
  const profile =
    viewer?.id != null ? await getPublicStudentProfile(userId, viewer.id) : null;
  return {
    title: profile ? profile.fullName : "Профиль студента",
  };
}

export default async function PublicStudentPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user?.profile) {
    redirect("/auth/login");
  }

  const { userId } = await params;
  const profile = await getPublicStudentProfile(userId, user.id);
  if (!profile) {
    notFound();
  }

  return (
    <DashboardShell stack="loose">
      <LearnPageWrap>
        <StudentPageHeader
          eyebrow="Рейтинг"
          title={profile.fullName}
          description="Прогресс по курсу, текущий модуль и открытые трофеи."
          backHref="/dashboard/leaderboard"
          backLabel="← К рейтингу"
        />

        <PublicStudentProfileView profile={profile} />

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/leaderboard">Турнирная таблица</Link>
          </Button>
          {profile.isSelf ? (
            <Button variant="primary" size="sm" asChild>
              <Link href="/dashboard/profile">Редактировать профиль</Link>
            </Button>
          ) : null}
        </div>
      </LearnPageWrap>
    </DashboardShell>
  );
}
