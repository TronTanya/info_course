import { describe, expect, it } from "vitest";
import { buildCertificateProgressPanelView } from "@/lib/certificate-progress-panel";
import type { CertificateDashboardState } from "@/lib/certificate";

const baseState = {
  courseId: "c1",
  courseTitle: "Кибербезопасность",
  courseHours: 120,
  progressPercent: 40,
  completedModules: 2,
  totalModules: 5,
  incompleteModules: [{ id: "m3", title: "Модуль 3" }],
  courseCompleted: false,
  canGenerate: false,
  lifecyclePhase: "in_progress",
  userFlow: "progress",
  studentDisplayName: "Студент",
  stepMetrics: {
    lessonsDone: 2,
    lessonsTotal: 5,
    testsDone: 1,
    testsTotal: 5,
    practiceDone: 0,
    practiceTotal: 5,
  },
  totalPoints: 30,
  maxPossiblePoints: 100,
  scoreSuccessPercent: 30,
  certificate: null,
  pdfInfrastructureReady: true,
} satisfies CertificateDashboardState;

describe("buildCertificateProgressPanelView", () => {
  it("marks unavailable when few requirements met", () => {
    const view = buildCertificateProgressPanelView(baseState);
    expect(view.status).toBe("unavailable");
    expect(view.statusLabel).toBe("Пока недоступен");
    expect(view.primaryCta.label).toBe("Продолжить курс");
    expect(view.requirements).toHaveLength(4);
  });

  it("marks almost ready when most requirements met", () => {
    const view = buildCertificateProgressPanelView({
      ...baseState,
      progressPercent: 80,
      stepMetrics: {
        lessonsDone: 5,
        lessonsTotal: 5,
        testsDone: 5,
        testsTotal: 5,
        practiceDone: 4,
        practiceTotal: 5,
      },
      scoreSuccessPercent: 75,
    });
    expect(view.status).toBe("almost_ready");
    expect(view.statusLabel).toBe("Почти готов");
  });

  it("marks ready when server allows generation", () => {
    const view = buildCertificateProgressPanelView({
      ...baseState,
      courseCompleted: true,
      canGenerate: true,
      lifecyclePhase: "ready_to_issue",
      userFlow: "ready",
      progressPercent: 100,
      completedModules: 5,
      totalModules: 5,
      incompleteModules: [],
      stepMetrics: {
        lessonsDone: 5,
        lessonsTotal: 5,
        testsDone: 5,
        testsTotal: 5,
        practiceDone: 5,
        practiceTotal: 5,
      },
      scoreSuccessPercent: 85,
    });
    expect(view.status).toBe("ready");
    expect(view.primaryCta.label).toBe("Получить сертификат");
    expect(view.remainingRequirements).toHaveLength(0);
  });

  it("marks issued with verify CTA", () => {
    const view = buildCertificateProgressPanelView({
      ...baseState,
      courseCompleted: true,
      canGenerate: true,
      lifecyclePhase: "issued",
      userFlow: "issued",
      certificate: {
        id: "cert1",
        certificateNumber: "CE-2026-ABC",
        issuedAt: new Date().toISOString(),
        verifyUrl: "https://app.example/verify/CE-2026-ABC",
        qrDataUrl: "data:image/png;base64,xx",
        registryStatus: "active",
        pdfReady: true,
      },
    });
    expect(view.status).toBe("issued");
    expect(view.statusLabel).toBe("Получен");
    expect(view.primaryCta.label).toBe("Скачать PDF");
    expect(view.secondaryCta?.label).toBe("Проверить подлинность");
    expect(view.secondaryCta?.href).toBe("https://app.example/verify/CE-2026-ABC");
  });
});
