import type { PracticalTaskType, SubmissionStatus } from "@prisma/client";
import { assertAdminDataAccess } from "@/lib/admin-access";
import { prisma } from "@/lib/db";
import { parsePracticeScenario } from "@/lib/practice-scenario-parse";
import {
  buildTaskInstructionsSections,
  isTaskInstructionsReady,
  splitPracticeInstructionText,
} from "@/lib/practice-task-instructions-ui";
import { formatPracticeReviewStudentLabel } from "@/lib/practice-review-queue-logic";
import { buildSafeRubricPreviewItems } from "@/lib/safe-rubric-mapper";
import type { SafeRubricItem } from "@/types/practice-view-model";

export type AdminSubmissionReviewMeta = {
  submissionId: string;
  status: SubmissionStatus;
  statusLabel: string;
  score: number | null;
  adminComment: string | null;
  submittedAt: string;
  updatedAt: string;
  checkedAt: string | null;
};

export type AdminSubmissionReviewStudent = {
  userId: string;
  label: string;
  email: string;
  educationalInstitution: string | null;
};

export type AdminSubmissionReviewTask = {
  title: string;
  moduleTitle: string;
  moduleId: string;
  courseId: string;
  taskType: PracticalTaskType;
  taskTypeLabel: string;
  maxScore: number;
  description: string;
};

export type AdminSubmissionReviewScenario = {
  role?: string;
  context?: string;
  goal: string;
  consoleScenario?: string;
};

export type AdminSubmissionReviewAnswer = {
  textAnswer: string | null;
  fileHref: string | null;
};

export type AdminSubmissionReviewData = {
  meta: AdminSubmissionReviewMeta;
  student: AdminSubmissionReviewStudent;
  task: AdminSubmissionReviewTask;
  scenario: AdminSubmissionReviewScenario | null;
  instructionLines: string[];
  instructionSections: ReturnType<typeof buildTaskInstructionsSections> | null;
  safeRubric: SafeRubricItem[];
  answer: AdminSubmissionReviewAnswer;
  courseCompletionHint: { allModulesDone: boolean; hasCertificate: boolean };
};

const STATUS_RU: Record<SubmissionStatus, string> = {
  DRAFT: "Черновик",
  SUBMITTED: "Отправлено",
  CHECKING: "На проверке",
  ACCEPTED: "Принято",
  REJECTED: "Отклонено",
  NEEDS_REVISION: "На доработку",
};

const TASK_TYPE_RU: Record<string, string> = {
  TEXT_ANSWER: "Текстовый ответ",
  FILE_UPLOAD: "Загрузка файла",
  INTERACTIVE: "Интерактив (консоль)",
  COMBINED: "Комбинированное",
  SITUATION_CHOICE: "Ситуации и выбор",
  PASSWORD_ANALYSIS: "Анализ паролей",
  PHISHING_ANALYSIS: "Разбор фишинга",
  CHECKLIST: "Чек-лист",
  URL_ANALYSIS: "Анализ ссылок",
  TRAINING_CONSOLE: "Учебная консоль",
  CRYPTO_TASK: "Криптография (учебно)",
  LOG_ANALYSIS: "Анализ журнала",
};

async function courseCompletionForUser(userId: string, courseId: string) {
  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    select: { id: true },
  });
  if (!modules.length) return { allModulesDone: false, hasCertificate: false };
  const progress = await prisma.progress.findMany({
    where: { userId, moduleId: { in: modules.map((m) => m.id) } },
    select: { moduleId: true, moduleCompleted: true },
  });
  const map = new Map(progress.map((p) => [p.moduleId, p.moduleCompleted]));
  const allModulesDone = modules.every((mod) => Boolean(map.get(mod.id)));
  const cert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  return { allModulesDone, hasCertificate: Boolean(cert) };
}

export async function getAdminSubmissionReviewData(
  submissionId: string,
): Promise<AdminSubmissionReviewData | null> {
  await assertAdminDataAccess();

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      userId: true,
      status: true,
      score: true,
      adminComment: true,
      textAnswer: true,
      fileUrl: true,
      createdAt: true,
      updatedAt: true,
      checkedAt: true,
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              middleName: true,
              educationalInstitution: true,
            },
          },
        },
      },
      practicalTask: {
        select: {
          id: true,
          title: true,
          description: true,
          instruction: true,
          consoleScenario: true,
          scenarioData: true,
          taskType: true,
          maxScore: true,
          module: { select: { id: true, title: true, courseId: true } },
        },
      },
    },
  });

  if (!sub || sub.status === "DRAFT") return null;

  const parsed = parsePracticeScenario(
    sub.practicalTask.description,
    sub.practicalTask.instruction,
    sub.practicalTask.consoleScenario,
    sub.practicalTask.scenarioData,
    sub.practicalTask.taskType,
  );

  const goal =
    parsed.taskBrief?.trim() ||
    sub.practicalTask.instruction?.trim() ||
    sub.practicalTask.description.trim().slice(0, 800);

  const scenario: AdminSubmissionReviewScenario | null = goal
    ? {
        role: parsed.studentRole?.trim() || undefined,
        context: parsed.inputData?.trim()
          ? parsed.inputData.trim().slice(0, 1200)
          : sub.practicalTask.description.split("\n\n")[0]?.trim().slice(0, 1200),
        goal,
        consoleScenario: sub.practicalTask.consoleScenario?.trim() || undefined,
      }
    : null;

  const instructionLines = sub.practicalTask.instruction?.trim()
    ? splitPracticeInstructionText(sub.practicalTask.instruction)
    : splitPracticeInstructionText(sub.practicalTask.description).slice(0, 8);

  const safeRubric = buildSafeRubricPreviewItems({
    scenarioData: sub.practicalTask.scenarioData,
    taskType: sub.practicalTask.taskType,
    maxScore: sub.practicalTask.maxScore,
  });

  const instructionSectionsBuilt = buildTaskInstructionsSections(
    instructionLines.map((text, i) => ({ id: `admin-instr-${i + 1}`, text })),
    safeRubric,
  );
  const instructionSections = isTaskInstructionsReady(instructionSectionsBuilt)
    ? instructionSectionsBuilt
    : null;

  const fileHref = sub.fileUrl?.startsWith("/api/") ? sub.fileUrl : null;

  return {
    meta: {
      submissionId: sub.id,
      status: sub.status,
      statusLabel: STATUS_RU[sub.status],
      score: sub.score,
      adminComment: sub.adminComment,
      submittedAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
      checkedAt: sub.checkedAt?.toISOString() ?? null,
    },
    student: {
      userId: sub.userId,
      label: formatPracticeReviewStudentLabel(sub.user.email, sub.user.profile),
      email: sub.user.email,
      educationalInstitution: sub.user.profile?.educationalInstitution ?? null,
    },
    task: {
      title: sub.practicalTask.title,
      moduleTitle: sub.practicalTask.module.title,
      moduleId: sub.practicalTask.module.id,
      courseId: sub.practicalTask.module.courseId,
      taskType: sub.practicalTask.taskType,
      taskTypeLabel: TASK_TYPE_RU[sub.practicalTask.taskType] ?? sub.practicalTask.taskType,
      maxScore: sub.practicalTask.maxScore,
      description: sub.practicalTask.description,
    },
    scenario,
    instructionLines,
    instructionSections,
    safeRubric,
    answer: {
      textAnswer: sub.textAnswer,
      fileHref,
    },
    courseCompletionHint: await courseCompletionForUser(sub.userId, sub.practicalTask.module.courseId),
  };
}
