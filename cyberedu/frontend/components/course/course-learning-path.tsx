import { CourseModuleCard } from "@/components/course/course-module-card";
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
    <div className="ce-course-track-map space-y-8 overflow-x-hidden lg:space-y-10">
      <CoursePathNav />
      <CourseTrackHero data={data} />

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Карта модулей"
          title="Лабораторные блоки трека"
          description="Проходите модули по порядку. На карточке — сложность, объём уроков и практик, прогресс и статус."
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
