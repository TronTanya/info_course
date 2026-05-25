import { LANDING_PROGRAM_MODULES } from "@/lib/landing-content";
import {
  getLockedUnlockHint,
  getModuleContentMeta,
  moduleDifficultyByOrder,
  moduleTimeEstimate,
} from "@/lib/course-path-ui";
import {
  getInnerStepEntityStatus,
  getInnerStepPresentation,
  getModuleEntityStatus,
  getModuleStatusPresentation,
  getStatusBadgeConfig,
  moduleStatusShellClass,
  type CourseEntityUiStatus,
  type CourseInnerStepKind,
} from "@/lib/course-ui-status";
import type { CourseProgressModuleRow } from "@/lib/progress";

export type ModuleCardStatus = CourseEntityUiStatus;

export type ModuleContentItemKind = "lessons" | "test" | "practice";

const kindToStep: Record<ModuleContentItemKind, CourseInnerStepKind> = {
  lessons: "lesson",
  test: "test",
  practice: "practice",
};

export type ModuleContentItem = {
  kind: ModuleContentItemKind;
  label: string;
  countLabel: string;
  stepStatus: CourseEntityUiStatus;
  statusLabel: string;
};

export function getModuleLockReason(row: CourseProgressModuleRow, modules: CourseProgressModuleRow[]): string {
  return getLockedUnlockHint(row, modules);
}

export function getModuleSkillLabel(row: CourseProgressModuleRow): string {
  const fromProgram = LANDING_PROGRAM_MODULES.find((m) => m.orderNumber === row.module.orderNumber);
  if (fromProgram) return fromProgram.skill;

  const title = row.module.title.toLowerCase();
  if (title.includes("фишинг") || title.includes("социальн")) {
    return "распознавать подозрительные письма и манипуляции";
  }
  if (title.includes("url") || title.includes("веб") || title.includes("интернет")) {
    return "проверять ссылки, домены и признаки опасных сайтов";
  }
  if (title.includes("крипт") || title.includes("данн")) {
    return "понимать хеширование, шифрование и хранение секретов";
  }
  if (title.includes("лог") || title.includes("инцидент") || title.includes("soc")) {
    return "читать события, находить аномалии и описывать инцидент";
  }
  if (title.includes("парол") || title.includes("аутент")) {
    return "настраивать надёжную аутентификацию и защиту учётных записей";
  }
  return "применять навыки информационной безопасности по теме модуля";
}

export function getModuleCardStatus(row: CourseProgressModuleRow): ModuleCardStatus {
  return getModuleEntityStatus(row);
}

export function getModuleCardBadge(status: ModuleCardStatus) {
  return getStatusBadgeConfig(status);
}

export function getModuleContentItems(row: CourseProgressModuleRow): ModuleContentItem[] {
  const meta = getModuleContentMeta(row);
  const items: ModuleContentItem[] = [];

  if (row.requirements.lessonRequired || row.requirements.videoRequired) {
    const stepStatus = getInnerStepEntityStatus(row, "lesson");
    items.push({
      kind: "lessons",
      label: "Уроки",
      countLabel: meta.lessonsLabel,
      stepStatus,
      statusLabel: getStatusBadgeConfig(stepStatus).label,
    });
  }
  if (row.requirements.testRequired) {
    const stepStatus = getInnerStepEntityStatus(row, "test");
    items.push({
      kind: "test",
      label: "Тест",
      countLabel: meta.testsLabel,
      stepStatus,
      statusLabel: getStatusBadgeConfig(stepStatus).label,
    });
  }
  if (row.requirements.practiceRequired) {
    const stepStatus = getInnerStepEntityStatus(row, "practice");
    items.push({
      kind: "practice",
      label: "Практика",
      countLabel: meta.practicesLabel,
      statusLabel: getStatusBadgeConfig(stepStatus).label,
      stepStatus,
    });
  }

  return items;
}

export function getModuleCardAction(
  row: CourseProgressModuleRow,
  modules: CourseProgressModuleRow[],
): { href: string; label: string; disabled: boolean } {
  const presentation = getModuleStatusPresentation(row, modules);
  const cta = presentation.primaryCta;
  return { href: cta.href ?? "#", label: cta.label, disabled: cta.disabled };
}

export function getModuleContentItemAction(
  row: CourseProgressModuleRow,
  kind: ModuleContentItemKind,
): { href: string; label: string; disabled: boolean } {
  const stepKind = kindToStep[kind];
  const presentation = getInnerStepPresentation(row, stepKind);
  const cta = presentation.primaryCta;
  return { href: cta.href ?? "#", label: cta.label, disabled: cta.disabled };
}

export function moduleCardShellClass(status: ModuleCardStatus, isCurrent = false): string {
  return moduleStatusShellClass(status, isCurrent);
}

export function moduleCardMeta(row: CourseProgressModuleRow) {
  return {
    difficulty: moduleDifficultyByOrder(row.module.orderNumber),
    estimate: moduleTimeEstimate(row.requirements),
    description:
      row.module.description?.trim() ||
      "Модуль программы: лекция, контрольный тест и практика в учебной лаборатории.",
    skill: getModuleSkillLabel(row),
  };
}
