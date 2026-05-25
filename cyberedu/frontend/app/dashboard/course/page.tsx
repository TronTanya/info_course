import type { Metadata } from "next";
import { CourseLearningPath } from "@/components/course/course-learning-path";
import { CoursePageShell } from "@/components/course/course-page-shell";
import {
  CourseNotFoundEmpty,
  CoursePageLoadError,
  CourseUnauthorizedState,
} from "@/components/course/course-page-states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert } from "@/components/ui/alert";
import { auth } from "@/lib/auth";
import { loadCoursePageData } from "@/lib/course-page-load";

export const metadata: Metadata = {
  title: "Курс",
};

type Props = { searchParams: Promise<{ locked?: string }> };

export default async function CoursePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <DashboardShell wide>
        <CourseUnauthorizedState />
      </DashboardShell>
    );
  }

  const result = await loadCoursePageData(session.user.id);

  if (result.status === "empty") {
    return (
      <DashboardShell wide>
        <CourseNotFoundEmpty />
      </DashboardShell>
    );
  }

  if (result.status === "error") {
    return (
      <DashboardShell wide>
        <CoursePageLoadError kind={result.kind} />
      </DashboardShell>
    );
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

        <CoursePageShell>
          <CourseLearningPath
            data={result.data}
            certState={result.certState}
            stats={result.stats}
          />
        </CoursePageShell>
      </>
    </DashboardShell>
  );
}
