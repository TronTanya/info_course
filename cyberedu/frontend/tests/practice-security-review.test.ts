import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertCleanPracticePageTask,
  assertSanitizedScenarioHasNoForbiddenKeys,
  PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS,
} from "@/lib/practice-security-audit";
import { buildPracticeViewModel } from "@/lib/practice-view-mapper";
import { sanitizeScenarioDataForStudent } from "@/lib/practice-student-scenario";
import { isSafePracticeFileUrl } from "@/lib/evidence-panel";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import type { PracticalTaskType } from "@prisma/client";

const root = join(process.cwd());

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const baseTask = {
  id: "task-sec-1",
  title: "Лаборатория",
  description: "Учебный сценарий без эталона в UI.",
  taskType: "TEXT_ANSWER" as PracticalTaskType,
  checkType: "MANUAL" as const,
  maxScore: 10,
  minLength: 10,
  instruction: "Опишите вывод.",
  consoleScenario: null,
  scenarioData: {
    hints: ["Шаг 1"],
    hiddenRubric: { criteria: [{ id: "c1", weight: 1 }] },
    answerKey: "secret",
    solution: "full",
    expectedCommand: "ping evil",
    privateStoragePath: "/var/secret/file.pdf",
  },
  hasInteractiveAutoCheck: false,
  hasStructuredCommandStep: false,
  hasStructuredExplanationStep: false,
  fileTypesLabel: null,
  fileMaxMb: null,
};

describe("practice client payload — forbidden fields", () => {
  it("PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS covers grading and storage leaks", () => {
    expect(PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS).toContain("hiddenRubric");
    expect(PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS).toContain("expectedCommand");
    expect(PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS).toContain("privateStoragePath");
  });

  it("sanitizeScenarioDataForStudent strips extended root keys", () => {
    assertSanitizedScenarioHasNoForbiddenKeys(baseTask.scenarioData);
    const safe = sanitizeScenarioDataForStudent(baseTask.scenarioData) as Record<string, unknown>;
    expect(safe.hiddenRubric).toBeUndefined();
    expect(safe.answerKey).toBeUndefined();
    expect(safe.expectedCommand).toBeUndefined();
    expect(safe.privateStoragePath).toBeUndefined();
  });

  it("buildPracticeViewModel + runtime scenarioData stay clean", () => {
    const view = buildPracticeViewModel({
      task: baseTask,
      moduleId: "mod-1",
      moduleTitle: "Модуль",
      moduleOrderNumber: 1,
      practiceGate: { ok: true },
      latestSubmission: null,
    });
    const task = {
      view,
      runtime: {
        id: baseTask.id,
        title: baseTask.title,
        description: baseTask.description,
        taskType: baseTask.taskType,
        checkType: baseTask.checkType,
        maxScore: baseTask.maxScore,
        minLength: baseTask.minLength,
        instruction: baseTask.instruction,
        consoleScenario: null,
        fileAccept: null,
        fileTypesLabel: null,
        fileMaxMb: null,
        hasInteractiveAutoCheck: false,
        hasStructuredCommandStep: false,
        hasStructuredExplanationStep: false,
        interactiveMode: "manual" as const,
        scenarioData: sanitizeScenarioDataForStudent(baseTask.scenarioData),
        latestSubmission: null,
        attemptCount: 0,
      },
    };
    assertCleanPracticePageTask(task);
    expect(JSON.stringify(task)).not.toMatch(/hiddenRubric|answerKey|privateStoragePath/i);
  });
});

describe("practice evidence — safe rendering (static)", () => {
  it("evidence panel does not use dangerouslySetInnerHTML", () => {
    const src = read("components/practice/evidence-panel.tsx");
    expect(src).not.toMatch(/dangerouslySetInnerHTML/);
  });

  it("suspicious URLs are copy-only, not navigable links", () => {
    const src = read("components/practice/evidence-panel.tsx");
    expect(src).toMatch(/Links \(копирование, без перехода\)/);
    expect(src).not.toMatch(/<a[^>]+href=\{href\}/);
    expect(src).toMatch(/isSafePracticeFileUrl|safePracticeDownloadHref/);
  });

  it("rejects raw storage paths and non-api download URLs", () => {
    expect(isSafePracticeFileUrl("/uploads/secret.pdf")).toBe(false);
    expect(isSafePracticeFileUrl("/api/practice/download?id=abc123")).toBe(true);
    expect(isSafePracticeFileUrl("/api/practice/download?id=..")).toBe(false);
  });
});

describe("practice submit — server contract (static)", () => {
  it("guardPracticeSubmission checks module and practice entry", () => {
    const src = read("lib/practice-submit-guard.ts");
    expect(src).toMatch(/checkModuleAccessForApi/);
    expect(src).toMatch(/checkPracticeEntry/);
    expect(src).toMatch(/checkPracticeTaskSubmitBlocked/);
  });

  it("server actions strip client payload and use rate limits", () => {
    const practice = read("lib/actions/practice.ts");
    expect(practice).toMatch(/buildPracticeTextSubmitPayload/);
    expect(practice).toMatch(/guardPracticeSubmission/);
    expect(practice).toMatch(/enforceServerActionRateLimit/);
    expect(practice).not.toMatch(/consumeRateLimitSync/);
  });

  it("submit flow uses confirmation lock against double submit", () => {
    const src = read("components/practice/practice-submission-submit-flow.tsx");
    expect(src).toMatch(/lockRef/);
  });

  it("upload routes validate files and use API guard", () => {
    expect(read("app/api/practice/upload-file/route.ts")).toMatch(/validatePracticeUpload/);
    expect(read("app/api/practice/upload-file/route.ts")).toMatch(/withApiGuard/);
  });
});

describe("practice access — locked module", () => {
  it("locked gate disables submit in view model", () => {
    const vm = buildPracticeViewModel({
      task: baseTask,
      moduleId: "mod-1",
      moduleTitle: "Модуль",
      moduleOrderNumber: 1,
      practiceGate: { ok: false, code: "TEST", message: "Сначала сдайте тест модуля." },
      latestSubmission: null,
    });
    expect(vm.status).toBe("locked");
    expect(vm.canSubmit).toBe(false);
    expect(vm.evidenceItems).toHaveLength(0);
  });

  it("practice page load returns locked status server-side", () => {
    const src = read("lib/practice-page-load.ts");
    expect(src).toMatch(/checkPracticeEntry/);
    expect(src).toMatch(/status: "locked"/);
  });
});

describe("practice AI — no solution in tutor context (static)", () => {
  it("AI chat loads only description fields for practical task", () => {
    const route = read("app/api/ai/chat/route.ts");
    expect(route).toMatch(/select: \{ moduleId: true, title: true, description: true, taskType: true, checkType: true \}/);
    expect(route).not.toMatch(/expectedAnswerPattern/);
    expect(route).not.toMatch(/scenarioData/);
    expect(route).toMatch(/checkPracticeEntry/);
  });

  it("page context uses sanitizeTaskDescriptionForPrompt", () => {
    expect(read("lib/ai/tutor/context/page-context.ts")).toMatch(/sanitizeTaskDescriptionForPrompt/);
  });

  it("practice mentor panel forbids leaking keys client-side", () => {
    const src = read("lib/practice-mentor-panel.ts");
    expect(src).toMatch(/PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS/);
    expect(src).toMatch(/без готового решения/i);
  });

  it("socratic practice mode forbids spoilers in system prompt", () => {
    expect(read("lib/ai/tutor/prompts/system.ts")).toMatch(/Без спойлеров и эталонного ответа/);
  });
});

describe("guardPracticeSubmission (unit shape)", () => {
  it("returns 401 without session", async () => {
    const r = await guardPracticeSubmission(undefined, "mod", "task", ["TEXT_ANSWER"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(401);
  });
});
