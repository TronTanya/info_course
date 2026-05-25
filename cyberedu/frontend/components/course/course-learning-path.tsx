import { CertificateProgressPanel } from "@/components/course/certificate-progress-panel";
import { buildCertificateProgressPanelView } from "@/lib/certificate-progress-panel";
import { CourseHeader } from "@/components/course/course-header";
import { CourseNoModulesEmpty, CourseNotStartedEmpty } from "@/components/course/course-page-empty";
import { StudentNavModuleSync } from "@/components/layout/student-nav-module-sync";
import { CoursePathNav } from "@/components/course/course-path-nav";
import { CourseProgressSummary } from "@/components/course/course-progress-summary";
import { CourseRoadmapModuleCards } from "@/components/course/course-roadmap-module-cards";
import { CourseRoadmapTimeline } from "@/components/course/course-roadmap-timeline";
import { WeakTopicsPanel } from "@/components/course/weak-topics-panel";
import { NextStepCard } from "@/components/course/next-step-card";
import type { CertificateDashboardState } from "@/lib/certificate";
import { buildCoursePageSummary } from "@/lib/course-page-summary";
import { isCourseNotStarted, isCourseWithoutModules } from "@/lib/course-page-state";
import { resolveCourseNextStep } from "@/lib/course-next-step";
import { findFocusModule } from "@/lib/dashboard-ui";
import type { UserCourseProgressResult } from "@/lib/progress";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";

export type CourseLearningPathProps = {
  data: UserCourseProgressResult;
  certState: CertificateDashboardState | null;
  stats: ProfileCourseStats | null;
};

export function CourseLearningPath({ data, certState, stats }: CourseLearningPathProps) {
  const modules = data.modules;
  const certificatePick = certState
    ? { certificate: certState.certificate, canGenerate: certState.canGenerate }
    : null;
  const summary = buildCoursePageSummary(data, certificatePick);
  const nextStep = resolveCourseNextStep(modules, certificatePick);
  const certificatePanel = certState ? buildCertificateProgressPanelView(certState) : null;
  const focus = findFocusModule(modules);
  const focusId = focus?.module.id ?? null;
  const noModules = isCourseWithoutModules(modules);
  const notStarted = isCourseNotStarted(modules);

  return (
    <div className="ce-course-roadmap mx-auto w-full min-w-0 max-w-full overflow-x-clip">
      <StudentNavModuleSync stats={stats} modules={modules} />
      <div className="ce-course-roadmap-layout flex flex-col gap-4 sm:gap-6 lg:gap-8">
        <div className="min-w-0 shrink-0">
          <CoursePathNav className="min-w-0" />
          {noModules ? <CourseNoModulesEmpty /> : null}
          {!noModules && notStarted ? <CourseNotStartedEmpty step={nextStep} /> : null}
        </div>

        <CourseHeader summary={summary} className="ce-course-roadmap__header order-1 min-w-0" />

        <NextStepCard step={nextStep} className="ce-course-roadmap__next order-2 min-w-0 lg:order-3" />

        <CourseProgressSummary summary={summary} className="ce-course-roadmap__summary order-3 min-w-0 lg:order-2" />

        {!noModules ? (
          <>
            <CourseRoadmapTimeline
              className="ce-course-roadmap__timeline order-4 min-w-0"
              modules={modules}
              focusModuleId={focusId}
              overallProgressPercent={data.overallProgressPercent}
              nextStepHref={nextStep.href}
              nextStepLabel={nextStep.ctaLabel}
            />
            <CourseRoadmapModuleCards
              className="ce-course-roadmap__modules order-5 min-w-0"
              modules={modules}
              focusModuleId={focusId}
            />
          </>
        ) : null}

        <div className="ce-course-roadmap__insights order-6 grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <WeakTopicsPanel stats={stats} modules={modules} className="min-w-0" />
          {certificatePanel ? <CertificateProgressPanel view={certificatePanel} className="min-w-0" /> : null}
        </div>
      </div>
    </div>
  );
}
