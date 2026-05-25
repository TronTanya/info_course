import { describe, expect, it } from "vitest";
import type { PracticalTaskType } from "@prisma/client";
import {
  assertCleanPracticeViewPayload,
  buildPracticeViewModel,
  resolvePracticeViewStatus,
} from "@/lib/practice-view-mapper";
import { PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/practice-view-model";

const baseTask = {
  id: "task-1",
  title: "Разбор фишинга",
  description: "Вы — аналитик SOC. Изучите учебное письмо и отметьте признаки риска.",
  taskType: "PHISHING_ANALYSIS" as PracticalTaskType,
  checkType: "AUTO" as const,
  maxScore: 10,
  minLength: 0,
  instruction: "Отметьте подозрительные элементы и кратко обоснуйте вывод.",
  consoleScenario: null,
  scenarioData: {
    hints: ["Проверьте домен отправителя", "Обратите внимание на срочность"],
    email: { from: "security@example.edu", subject: "Срочно", body: "Учебный текст" },
    solution: "hidden",
    answerKey: "all-flags",
  },
  hasInteractiveAutoCheck: false,
  hasStructuredCommandStep: false,
  hasStructuredExplanationStep: false,
  fileTypesLabel: null,
  fileMaxMb: null,
};

describe("resolvePracticeViewStatus", () => {
  it("maps rejected separately from needs_retry", () => {
    expect(resolvePracticeViewStatus({ gateOk: true, submissionStatus: "REJECTED" })).toBe("rejected");
    expect(resolvePracticeViewStatus({ gateOk: true, submissionStatus: "NEEDS_REVISION" })).toBe(
      "needs_retry",
    );
  });

  it("returns locked when gate fails", () => {
    expect(resolvePracticeViewStatus({ gateOk: false })).toBe("locked");
  });
});

describe("buildPracticeViewModel", () => {
  it("builds safe view without forbidden keys", () => {
    const vm = buildPracticeViewModel({
      task: baseTask,
      moduleId: "mod-1",
      moduleTitle: "Фишинг",
      moduleOrderNumber: 2,
      practiceGate: { ok: true },
      latestSubmission: null,
    });

    expect(vm.title).toBe("Разбор фишинга");
    expect(vm.moduleId).toBe("mod-1");
    expect(vm.status).toBe("not_started");
    expect(vm.canSubmit).toBe(true);
    expect(vm.canRetry).toBe(false);
    expect(vm.scenario?.goal).toContain("Отметьте");
    expect(vm.evidenceItems.length).toBeGreaterThan(0);
    expect(vm.safeRubric.length).toBeGreaterThan(0);
    expect(vm.hints).toHaveLength(2);
    expect(vm.hints[0]?.level).toBe(1);

    assertCleanPracticeViewPayload(vm);
  });

  it("does not expose admin feedback before review outcome", () => {
    const vm = buildPracticeViewModel({
      task: baseTask,
      moduleId: "mod-1",
      moduleTitle: "Фишинг",
      moduleOrderNumber: 2,
      practiceGate: { ok: true },
      latestSubmission: {
        id: "sub-1",
        status: "SUBMITTED",
        score: null,
        adminComment: "Секретный комментарий до проверки",
        createdAt: new Date().toISOString(),
        fileDownloadUrl: null,
      },
    });

    expect(vm.status).toBe("submitted");
    expect(vm.canSubmit).toBe(false);
    expect(vm.submission?.feedback).toBeUndefined();
    assertCleanPracticeViewPayload(vm);
  });

  it("shows feedback only after reject or accept", () => {
    const vm = buildPracticeViewModel({
      task: baseTask,
      moduleId: "mod-1",
      moduleTitle: "Фишинг",
      moduleOrderNumber: 2,
      practiceGate: { ok: true },
      latestSubmission: {
        id: "sub-2",
        status: "NEEDS_REVISION",
        score: 4,
        adminComment: "Добавьте обоснование по ссылке.",
        createdAt: new Date().toISOString(),
        fileDownloadUrl: null,
      },
    });

    expect(vm.status).toBe("needs_retry");
    expect(vm.canRetry).toBe(true);
    expect(vm.canSubmit).toBe(true);
    expect(vm.submission?.canEdit).toBe(true);
    expect(vm.submission?.feedback).toBe("Добавьте обоснование по ссылке.");
    assertCleanPracticeViewPayload(vm);
  });

  it("locks practice with reason when gate fails", () => {
    const vm = buildPracticeViewModel({
      task: baseTask,
      moduleId: "mod-1",
      moduleTitle: "Фишинг",
      moduleOrderNumber: 2,
      practiceGate: { ok: false, code: "TEST", message: "Сначала пройдите тест." },
      latestSubmission: null,
    });

    expect(vm.status).toBe("locked");
    expect(vm.lockedReason).toContain("тест");
    expect(vm.canSubmit).toBe(false);
    expect(vm.evidenceItems).toHaveLength(0);
    assertCleanPracticeViewPayload(vm);
  });

  it("forbidden keys list covers grading leaks", () => {
    expect(PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS).toContain("expectedAnswerPattern");
    expect(PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS).toContain("answerKey");
  });
});
