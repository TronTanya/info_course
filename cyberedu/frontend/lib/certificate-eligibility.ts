import type { CertificateDashboardState } from "@/lib/certificate";
import type { DashboardStepMetrics } from "@/lib/dashboard-ui";

/** Единое описание правил выдачи (совпадает с `canGenerateCertificate` на сервере). */
export const CERTIFICATE_ELIGIBILITY_RULE =
  "Сертификат выдаётся после завершения всех активных модулей курса: лекции, тесты и практики в рамках каждого модуля.";

export type CertificateRequirementId = "modules" | "lessons" | "tests" | "practice";

export type CertificateRequirementRow = {
  id: CertificateRequirementId;
  label: string;
  detail: string;
  met: boolean;
};

export type CertificateLifecyclePhase = "not_started" | "in_progress" | "ready_to_issue" | "issued";

export const CERTIFICATE_LIFECYCLE_LABELS: Record<CertificateLifecyclePhase, string> = {
  not_started: "Пока недоступен",
  in_progress: "В процессе",
  ready_to_issue: "Готов к получению",
  issued: "Получен",
};

type RequirementInput = {
  completedModules: number;
  totalModules: number;
  courseCompleted: boolean;
  metrics: DashboardStepMetrics;
};

export function buildCertificateRequirementRows(input: RequirementInput): CertificateRequirementRow[] {
  const { completedModules, totalModules, courseCompleted, metrics } = input;
  return [
    {
      id: "modules",
      label: "Завершить все модули",
      detail: `${completedModules} из ${totalModules} модулей`,
      met: courseCompleted,
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
  ];
}

export function resolveCertificateLifecyclePhase(
  state: Pick<
    CertificateDashboardState,
    "certificate" | "canGenerate" | "completedModules" | "totalModules"
  >,
): CertificateLifecyclePhase {
  if (state.certificate) return "issued";
  if (state.canGenerate) return "ready_to_issue";
  if (state.totalModules > 0 && state.completedModules > 0) return "in_progress";
  return "not_started";
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
    items.push("Нажмите «Получить сертификат» — документ создаётся на сервере");
  }

  return [...new Set(items)];
}
