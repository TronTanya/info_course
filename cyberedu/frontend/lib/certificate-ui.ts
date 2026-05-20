import type { CertificateDashboardState } from "@/lib/certificate";
import type { DashboardStepMetrics } from "@/lib/dashboard-ui";

export type CertificateRequirementId = "modules" | "lessons" | "tests" | "practice" | "min_score";

export type CertificateRequirementRow = {
  id: CertificateRequirementId;
  label: string;
  detail: string;
  met: boolean;
};

/** Порог для отображения «минимального балла» (не ослабляет server-side eligibility). */
export const CERTIFICATE_MIN_SCORE_PERCENT = 70;

export function buildCertificateRequirements(
  state: CertificateDashboardState,
  metrics: DashboardStepMetrics,
  scoreSuccessPercent: number,
  maxPossiblePoints: number,
): CertificateRequirementRow[] {
  const rows: CertificateRequirementRow[] = [
    {
      id: "modules",
      label: "Завершить все модули",
      detail: `${state.completedModules} из ${state.totalModules} модулей`,
      met: state.courseCompleted,
    },
    {
      id: "lessons",
      label: "Пройти лекции",
      detail:
        metrics.lessonsTotal > 0
          ? `${metrics.lessonsDone} / ${metrics.lessonsTotal} лекций`
          : "Лекции не требуются",
      met: metrics.lessonsTotal === 0 || metrics.lessonsDone >= metrics.lessonsTotal,
    },
    {
      id: "tests",
      label: "Сдать тесты",
      detail:
        metrics.testsTotal > 0 ? `${metrics.testsDone} / ${metrics.testsTotal} тестов` : "Тесты не требуются",
      met: metrics.testsTotal === 0 || metrics.testsDone >= metrics.testsTotal,
    },
    {
      id: "practice",
      label: "Выполнить практики",
      detail:
        metrics.practiceTotal > 0
          ? `${metrics.practiceDone} / ${metrics.practiceTotal} практик`
          : "Практика не требуется",
      met: metrics.practiceTotal === 0 || metrics.practiceDone >= metrics.practiceTotal,
    },
    {
      id: "min_score",
      label: "Минимальный балл по курсу",
      detail:
        maxPossiblePoints > 0
          ? `${scoreSuccessPercent}% набрано (порог ${CERTIFICATE_MIN_SCORE_PERCENT}%)`
          : "Баллы не начисляются",
      met: maxPossiblePoints === 0 || scoreSuccessPercent >= CERTIFICATE_MIN_SCORE_PERCENT,
    },
  ];
  return rows;
}

export function buildCertificateRemainingItems(
  state: CertificateDashboardState,
  requirements: CertificateRequirementRow[],
): string[] {
  const items: string[] = [];

  if (!state.courseCompleted && state.incompleteModules.length > 0) {
    for (const m of state.incompleteModules.slice(0, 4)) {
      items.push(`Завершить модуль «${m.title}»`);
    }
    if (state.incompleteModules.length > 4) {
      items.push(`Ещё ${state.incompleteModules.length - 4} модулей в программе`);
    }
  }

  for (const req of requirements) {
    if (!req.met && req.id !== "modules") {
      items.push(req.label);
    }
  }

  if (state.courseCompleted && !state.certificate) {
    items.push("Сгенерировать сертификат в блоке ниже");
  }

  return [...new Set(items)];
}
