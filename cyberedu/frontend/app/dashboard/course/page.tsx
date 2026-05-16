import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CourseLearningPath } from "@/components/course/course-learning-path";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert } from "@/components/ui/alert";
import { getDefaultCourseForDashboard, syncAndGetUserCourseProgress } from "@/lib/progress";
import { requireAuth } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Курс",
};

type Props = { searchParams: Promise<{ locked?: string }> };

export default async function CoursePage({ searchParams }: Props) {
  const session = await requireAuth();
  const course = await getDefaultCourseForDashboard();
  if (!course) {
    return (
      <DashboardShell wide>
        <p className="text-sm text-muted-foreground">Курс ещё не добавлен в систему.</p>
      </DashboardShell>
    );
  }

  const data = await syncAndGetUserCourseProgress(session.user.id, course.id);
  if (!data) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const locked = sp.locked === "1";

  return (
    <DashboardShell wide>
      <>
        {locked ? (
          <Alert variant="warning" title="Модуль недоступен">
            Завершите предыдущий модуль, чтобы открыть этот. Курс проходится по порядку сверху вниз.
          </Alert>
        ) : null}

        <CourseLearningPath data={data} />
      </>
    </DashboardShell>
  );
}
