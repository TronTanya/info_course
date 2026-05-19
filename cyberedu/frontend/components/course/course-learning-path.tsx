import { CourseContinueStrip } from "@/components/course/course-continue-strip";
import { CourseModuleCard } from "@/components/course/course-module-card";
import { CoursePathNav } from "@/components/course/course-path-nav";
import { CourseTrackHero } from "@/components/course/course-track-hero";
import { CourseTrajectoryMap } from "@/components/course/course-trajectory-map";
import { findFocusModule } from "@/lib/dashboard-ui";
import type { UserCourseProgressResult } from "@/lib/progress";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { SectionHeader } from "@/components/ui/section-header";

export function CourseLearningPath({ data }: { data: UserCourseProgressResult }) {
  const focus = findFocusModule(data.modules);
  const focusId = focus?.module.id;

  return (
    <div className="ce-course-track-map space-y-6 overflow-x-hidden sm:space-y-8 lg:space-y-10">
      <CoursePathNav />
      <CourseTrackHero data={data} />
      <CourseContinueStrip data={data} />
      <CourseTrajectoryMap modules={data.modules} focusModuleId={focusId} />

      <section className="space-y-5" aria-labelledby="course-modules-heading">
        <SectionHeader
          eyebrow="Модули"
          title="Учебная траектория"
          description="Каждый модуль — лекция, тест и практика. Статусы: не начат, в процессе, завершён. Закрытые модули откроются после предыдущего."
        />
        <ResponsiveGrid>
          {data.modules.map((row, index) => (
            <CourseModuleCard
              key={row.module.id}
              row={row}
              index={index}
              isNext={Boolean(focusId && row.module.id === focusId)}
            />
          ))}
        </ResponsiveGrid>
      </section>
    </div>
  );
}
