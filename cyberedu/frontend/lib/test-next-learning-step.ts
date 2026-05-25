import type { CoursePageCertificateSummary } from "@/lib/course-page-summary";
import { resolveNextCourseModule } from "@/lib/lesson-navigation-ui";
import type { LearningNavModuleItem } from "@/lib/learning-nav";
import { TEST_RESULT_CTA } from "@/lib/test-flow";
import type { TestNextStep } from "@/types/test-view-model";

/** Контекст курса/модуля с сервера (страница теста). */
export type TestPageLearningContext = {
  moduleId: string;
  moduleTitle: string;
  courseTitle: string;
  courseHref: string;
  lessonHref: string;
  practiceHref: string;
  moduleHref: string;
  hasPractice: boolean;
  practiceRequired: boolean;
  practiceCompleted: boolean;
  moduleCompleted: boolean;
  allModulesComplete: boolean;
  courseModules: LearningNavModuleItem[];
  relatedLessons: TestNextStep[];
  certificate: CoursePageCertificateSummary | null;
};

export type TestNextLearningStepVariant =
  | "passed_practice"
  | "failed_review"
  | "next_module"
  | "course_certificate";

export type TestNextLearningStepLesson = {
  title: string;
  href: string;
};

export type TestNextLearningStepView = {
  variant: TestNextLearningStepVariant;
  headline: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
    disabled?: boolean;
    hint?: string;
  };
  relatedLessons: TestNextLearningStepLesson[];
  secondaryCta?: { label: string; href: string; hint?: string };
  certificateCta?: { label: string; href: string; hint?: string };
};

export function buildTestPageRelatedLessons(
  moduleId: string,
  moduleTitle: string,
): TestNextStep[] {
  const lessonHref = `/dashboard/course/${moduleId}/lesson`;
  return [
    {
      title: `Повторить материал · ${moduleTitle}`,
      href: lessonHref,
      type: "lesson",
    },
  ];
}

/** Практика доступна только после зачёта теста и если она есть в программе модуля. */
export function isPracticeUnlockedAfterTest(
  ctx: Pick<TestPageLearningContext, "hasPractice" | "practiceRequired">,
  testPassed: boolean,
): boolean {
  if (!testPassed || !ctx.hasPractice || !ctx.practiceRequired) return false;
  return true;
}

function moduleCompleteAfterTest(
  ctx: TestPageLearningContext,
  testPassed: boolean,
): boolean {
  if (ctx.moduleCompleted) return true;
  if (!testPassed) return false;
  if (!ctx.practiceRequired) return true;
  return ctx.practiceCompleted;
}

function toLessonList(related: TestNextStep[]): TestNextLearningStepLesson[] {
  return related
    .filter((s) => s.type === "lesson" && s.href.includes("/lesson"))
    .map((s) => ({ title: s.title, href: s.href }));
}

/**
 * Следующий шаг обучения после результата теста.
 * Только существующие маршруты; практика не предлагается без зачёта теста.
 */
export function buildTestNextLearningStep(
  ctx: TestPageLearningContext,
  testPassed: boolean,
): TestNextLearningStepView {
  const lessons = toLessonList(ctx.relatedLessons);
  const lessonFallback = lessons[0] ?? {
    title: `Повторить материал · ${ctx.moduleTitle}`,
    href: ctx.lessonHref,
  };

  const nextModule = resolveNextCourseModule(ctx.courseModules, ctx.moduleId);
  const moduleDone = moduleCompleteAfterTest(ctx, testPassed);
  const practiceOpen = isPracticeUnlockedAfterTest(ctx, testPassed);

  if (ctx.allModulesComplete && ctx.certificate) {
    return {
      variant: "course_certificate",
      headline: "Программа завершена",
      description: ctx.certificate.detail,
      primaryCta: {
        label: ctx.certificate.cta.label,
        href: ctx.certificate.cta.href,
        hint: ctx.certificate.issued
          ? "Сертификат уже в личном кабинете."
          : ctx.certificate.ready
            ? "Все модули сданы — оформите документ."
            : "Проверьте оставшиеся условия выдачи.",
      },
      relatedLessons: lessons,
      secondaryCta: {
        label: TEST_RESULT_CTA.course,
        href: ctx.courseHref,
        hint: ctx.courseTitle,
      },
    };
  }

  if (moduleDone && nextModule) {
    const cert = ctx.certificate;
    return {
      variant: "next_module",
      headline: "Модуль завершён",
      description: `Отличная работа по «${ctx.moduleTitle}». Продолжайте со следующим модулем курса.`,
      primaryCta: {
        label: "Следующий модуль",
        href: nextModule.href,
        hint: nextModule.title,
      },
      relatedLessons: lessons,
      secondaryCta: {
        label: "Обзор модуля",
        href: ctx.moduleHref,
      },
      certificateCta:
        cert && (cert.ready || cert.issued)
          ? { label: cert.cta.label, href: cert.cta.href, hint: cert.statusLabel }
          : undefined,
    };
  }

  if (moduleDone && !nextModule && ctx.certificate) {
    return {
      variant: "course_certificate",
      headline: "Все модули пройдены",
      description: ctx.certificate.detail,
      primaryCta: {
        label: ctx.certificate.cta.label,
        href: ctx.certificate.cta.href,
      },
      relatedLessons: lessons,
      secondaryCta: { label: TEST_RESULT_CTA.course, href: ctx.courseHref },
    };
  }

  if (testPassed && practiceOpen) {
    return {
      variant: "passed_practice",
      headline: "Следующий шаг: практическая лаборатория",
      description: "Закрепите материал модуля в лабораторном сценарии — практика открыта после зачёта теста.",
      primaryCta: {
        label: TEST_RESULT_CTA.practice,
        href: ctx.practiceHref,
        hint: ctx.moduleTitle,
      },
      relatedLessons: lessons,
      secondaryCta: {
        label: "Обзор модуля",
        href: ctx.moduleHref,
      },
    };
  }

  if (testPassed && !practiceOpen) {
    return {
      variant: "passed_practice",
      headline: "Тест засчитан",
      description: "Практика для этого модуля не требуется — вернитесь к карте курса или повторите материал.",
      primaryCta: {
        label: TEST_RESULT_CTA.course,
        href: ctx.courseHref,
      },
      relatedLessons: lessons,
      secondaryCta: {
        label: TEST_RESULT_CTA.reviewMaterial,
        href: lessonFallback.href,
      },
    };
  }

  return {
    variant: "failed_review",
    headline: "Сначала повторите темы",
    description:
      "Вернитесь к лекции и разделам из блока «Слабые темы», затем пересдайте тест. Практика откроется после зачёта.",
    primaryCta: {
      label: TEST_RESULT_CTA.reviewMaterial,
      href: lessonFallback.href,
      hint: lessonFallback.title,
    },
    relatedLessons: lessons.length > 0 ? lessons : [lessonFallback],
    secondaryCta: {
      label: "Обзор модуля",
      href: ctx.moduleHref,
    },
  };
}
