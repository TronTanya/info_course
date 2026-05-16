import type { ModuleRequirements, ProgressRow } from "@/lib/progress";

export type ModuleHubStepKind = "lecture" | "video" | "test" | "practice" | "result";

/** UI-статус шага прохождения */
export type ModuleHubStepStatus = "not_started" | "available" | "completed" | "blocked";

export type ModuleHubStepView = {
  kind: ModuleHubStepKind;
  order: number;
  title: string;
  description: string;
  status: ModuleHubStepStatus;
  actionLabel?: string;
  actionHref?: string;
};

function emptyFlags(): Pick<
  ProgressRow,
  "lessonCompleted" | "videoCompleted" | "testCompleted" | "practiceCompleted" | "moduleCompleted"
> {
  return {
    lessonCompleted: false,
    videoCompleted: false,
    testCompleted: false,
    practiceCompleted: false,
    moduleCompleted: false,
  };
}

function lectureDone(p: Pick<ProgressRow, "lessonCompleted">) {
  return p.lessonCompleted;
}

function testDone(req: ModuleRequirements, p: Pick<ProgressRow, "testCompleted">) {
  return !req.testRequired || p.testCompleted;
}

function practiceDone(req: ModuleRequirements, p: Pick<ProgressRow, "practiceCompleted">) {
  return !req.practiceRequired || p.practiceCompleted;
}

/**
 * Цепочка: лекция → (видео, если есть) → тест (после лекции и видео) → практика (после теста) → результат (после успешной практики).
 */
export function buildModuleHubSteps(
  moduleId: string,
  unlocked: boolean,
  req: ModuleRequirements,
  progress: ProgressRow | null,
): ModuleHubStepView[] {
  const f = progress
    ? {
        lessonCompleted: progress.lessonCompleted,
        videoCompleted: progress.videoCompleted,
        testCompleted: progress.testCompleted,
        practiceCompleted: progress.practiceCompleted,
        moduleCompleted: progress.moduleCompleted,
      }
    : emptyFlags();

  const base = `/dashboard/course/${moduleId}`;

  const lectureCompleted = lectureDone(f);
  const testCompleted = testDone(req, f);
  const practiceCompleted = practiceDone(req, f);
  const resultCompleted = f.moduleCompleted;

  const lectureBlocked = !unlocked;
  const testBlocked = !unlocked || !lectureCompleted || (req.videoRequired && !f.videoCompleted);
  const practiceBlocked = !unlocked || !testCompleted;
  const resultBlocked = !unlocked || !practiceCompleted;

  type Raw = { completed: boolean; blocked: boolean; kind: ModuleHubStepKind; title: string; description: string };
  const raw: Raw[] = [];

  raw.push({
    kind: "lecture",
    title: "Лекция",
    description: "Текстовые материалы и навигация по теме модуля.",
    completed: lectureCompleted,
    blocked: lectureBlocked,
  });

  if (req.videoRequired) {
    raw.push({
      kind: "video",
      title: "Видео",
      description: "Просмотр видеоматериала по модулю.",
      completed: f.videoCompleted,
      blocked: !unlocked || !lectureCompleted,
    });
  }

  raw.push({
    kind: "test",
    title: "Тест",
    description: "Контрольные вопросы по содержанию лекции.",
    completed: testCompleted,
    blocked: testBlocked,
  });

  raw.push({
    kind: "practice",
    title: "Практика",
    description: "Практическое задание; после принятия работы модуль засчитывается.",
    completed: practiceCompleted,
    blocked: practiceBlocked,
  });

  raw.push({
    kind: "result",
    title: "Результат модуля",
    description: "Итог по баллам и статусу завершения.",
    completed: resultCompleted,
    blocked: resultBlocked,
  });

  const firstIdx = raw.findIndex((s) => !s.completed && !s.blocked);

  return raw.map((s, i) => {
    let status: ModuleHubStepStatus;
    if (s.blocked) status = "blocked";
    else if (s.completed) status = "completed";
    else if (i === firstIdx) status = "available";
    else status = "not_started";

    let actionLabel: string | undefined;
    let actionHref: string | undefined;

    if (!s.blocked && s.kind === "lecture") {
      actionLabel = "Перейти к лекции";
      actionHref = `${base}/lesson`;
    }
    if (!s.blocked && s.kind === "test") {
      actionLabel = "Пройти тест";
      actionHref = `${base}/test`;
    }
    if (!s.blocked && s.kind === "practice") {
      actionLabel = "Выполнить практику";
      actionHref = `${base}/practice`;
    }
    if (!s.blocked && s.kind === "result" && (s.completed || practiceCompleted)) {
      actionLabel = "Посмотреть результат";
      actionHref = `${base}#module-result`;
    }
    if (!s.blocked && s.kind === "video" && req.videoRequired) {
      actionLabel = "Смотреть видео";
      actionHref = `${base}/lesson`;
    }

    return {
      kind: s.kind,
      order: i + 1,
      title: s.title,
      description: s.description,
      status,
      actionLabel,
      actionHref,
    };
  });
}
