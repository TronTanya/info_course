import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CourseEmpty } from "@/components/course/course-empty";
import { CourseLearningPath } from "@/components/course/course-learning-path";
import { CourseLockedBanner } from "@/components/course/course-locked-banner";
import { CoursePageShell } from "@/components/course/course-page-shell";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getContinueFromModules } from "@/lib/dashboard-ui";
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
        <CourseEmpty />
      </DashboardShell>
    );
  }

  const data = await syncAndGetUserCourseProgress(session.user.id, course.id);
  if (!data) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const locked = sp.locked === "1";
  const cta = getContinueFromModules(data.modules, data.course.title);

  return (
    <DashboardShell wide>
      <>
        {locked ? (
          <CourseLockedBanner continueHref={cta.href} continueLabel={`${cta.label} →`} className="mb-6" />
        ) : null}

        <CoursePageShell>
          <CourseLearningPath data={data} />
        </CoursePageShell>
      </>
    </DashboardShell>
  );
}
