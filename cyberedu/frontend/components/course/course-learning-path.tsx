import { CourseModuleCard } from "@/components/course/course-module-card";
import { CourseMissionRoadmap } from "@/components/course/course-mission-roadmap";
import { CoursePathNav } from "@/components/course/course-path-nav";
import { CourseTrackHero } from "@/components/course/course-track-hero";
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
      <CourseMissionRoadmap modules={data.modules} focusModuleId={focusId} />

      <section className="space-y-5 border-t border-border/60 pt-8" aria-labelledby="course-modules-heading">
        <SectionHeader
          eyebrow="Детали"
          title="Карточки модулей"
          description="Развёрнутый вид каждой миссии: шаги внутри модуля, баллы и быстрые действия."
        />
        <ResponsiveGrid className="lg:grid-cols-2 xl:grid-cols-3">
          {data.modules.map((row, index) => (
            <CourseModuleCard
              key={row.module.id}
              row={row}
              index={index}
              modules={data.modules}
              isNext={Boolean(focusId && row.module.id === focusId)}
            />
          ))}
        </ResponsiveGrid>
      </section>
    </div>
  );
}
