import type { CoursePageCertificateSummary } from "@/lib/course-page-summary";
import { resolveNextCourseModule } from "@/lib/lesson-navigation-ui";
import type { LearningNavModuleItem } from "@/lib/learning-nav";

export type PracticePageLearningContext = {
  moduleId: string;
  moduleTitle: string;
  courseTitle: string;
  courseHref: string;
  lessonHref: string;
  testHref: string;
  moduleHref: string;
  moduleCompleted: boolean;
  practiceCompleted: boolean;
  allModulesComplete: boolean;
  courseModules: LearningNavModuleItem[];
  certificate: CoursePageCertificateSummary | null;
};

export type PracticeNextLearningStepView = {
  headline: string;
  description: string;
  primaryCta: { label: string; href: string; hint?: string };
  secondaryCta?: { label: string; href: string; hint?: string };
  certificateCta?: { label: string; href: string; hint?: string };
};

export function buildPracticeNextLearningStep(
  ctx: PracticePageLearningContext,
  practiceAccepted: boolean,
): PracticeNextLearningStepView | null {
  if (!practiceAccepted) return null;

  const nextModule = resolveNextCourseModule(ctx.courseModules, ctx.moduleId);

  if (ctx.allModulesComplete && ctx.certificate) {
    return {
      headline: "Программа завершена",
      description: ctx.certificate.detail,
      primaryCta: { label: ctx.certificate.cta.label, href: ctx.certificate.cta.href },
      secondaryCta: { label: "К карте курса", href: ctx.courseHref, hint: ctx.courseTitle },
    };
  }

  if (ctx.moduleCompleted && nextModule) {
    return {
      headline: "Модуль завершён",
      description: `Практика по «${ctx.moduleTitle}» зачтена. Переходите к следующему модулю.`,
      primaryCta: { label: "Следующий модуль", href: nextModule.href, hint: nextModule.title },
      secondaryCta: { label: "Обзор модуля", href: ctx.moduleHref },
      certificateCta:
        ctx.certificate && (ctx.certificate.ready || ctx.certificate.issued)
          ? { label: ctx.certificate.cta.label, href: ctx.certificate.cta.href, hint: ctx.certificate.statusLabel }
          : undefined,
    };
  }

  if (ctx.moduleCompleted && !nextModule && ctx.certificate) {
    return {
      headline: "Все модули пройдены",
      description: ctx.certificate.detail,
      primaryCta: { label: ctx.certificate.cta.label, href: ctx.certificate.cta.href },
      secondaryCta: { label: "К карте курса", href: ctx.courseHref },
    };
  }

  return {
    headline: "Практика зачтена",
    description: "Вернитесь к обзору модуля или повторите лекцию для закрепления.",
    primaryCta: { label: "Обзор модуля", href: ctx.moduleHref },
    secondaryCta: { label: "Повторить лекцию", href: ctx.lessonHref },
  };
}
