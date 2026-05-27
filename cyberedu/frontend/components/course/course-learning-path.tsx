import { CourseModuleCard } from "@/components/course/course-module-card";
import { CourseMissionRoadmap } from "@/components/course/course-mission-roadmap";
import { CoursePathNav } from "@/components/course/course-path-nav";
import { CourseTrackHero } from "@/components/course/course-track-hero";
import { CourseTrackLegend } from "@/components/course/course-track-legend";
import { findFocusModule } from "@/lib/dashboard-ui";
import type { UserCourseProgressResult } from "@/lib/progress";
import { BlurReveal } from "@/components/motion";
import { MobileImmersiveCard, MobileSnapRow } from "@/components/mobile";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { SectionHeader } from "@/components/ui/section-header";

export function CourseLearningPath({ data }: { data: UserCourseProgressResult }) {
  const focus = findFocusModule(data.modules);
  const focusId = focus?.module.id;

  return (
    <div className="ce-learn-os-map ce-course-track-map ce-mobile-stack space-y-6 overflow-x-hidden sm:space-y-8 lg:space-y-10">
      <CoursePathNav />
      <MobileImmersiveCard className="lg:contents" delay={0}>
        <CourseTrackHero data={data} />
      </MobileImmersiveCard>
      <CourseMissionRoadmap modules={data.modules} focusModuleId={focusId} />
      <CourseTrackLegend />

      <BlurReveal as="section" className="space-y-5 border-t border-white/8 pt-6 lg:pt-8" delay={0.06} aria-labelledby="course-modules-heading">
        <SectionHeader
          titleId="course-modules-heading"
          eyebrow="Модули курса"
          title="Карточки операций"
          description="Развёрнутый вид каждой миссии: шаги, баллы и быстрые действия в учебной ОС."
        />
        <MobileSnapRow>
          {data.modules.map((row, index) => (
            <CourseModuleCard
              key={row.module.id}
              row={row}
              index={index}
              modules={data.modules}
              isNext={Boolean(focusId && row.module.id === focusId)}
            />
          ))}
        </MobileSnapRow>
        <ResponsiveGrid className="mt-3 hidden list-none p-0 lg:mt-0 lg:grid lg:grid-cols-2 xl:grid-cols-3">
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
      </BlurReveal>
    </div>
  );
}
