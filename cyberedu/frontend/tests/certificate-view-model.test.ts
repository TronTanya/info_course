import { describe, expect, it } from "vitest";
import type { CertificateDashboardState } from "@/lib/certificate";
import {
  assertNoForbiddenCertificateViewKeys,
  mapDashboardStateToCertificateProgressViewModel,
  mapDashboardStateToCertificateViewModel,
  mapVerifyPayloadToPresentationModel,
  VERIFY_PUBLIC_MESSAGES,
} from "@/lib/certificate-view-model";

const baseState = {
  courseId: "c1",
  courseTitle: "IB",
  courseHours: 120,
  progressPercent: 100,
  completedModules: 3,
  totalModules: 3,
  incompleteModules: [],
  courseCompleted: true,
  canGenerate: true,
  lifecyclePhase: "ready_to_issue" as const,
  userFlow: "ready" as const,
  studentDisplayName: "Иванов Иван",
  stepMetrics: {
    lessonsDone: 3,
    lessonsTotal: 3,
    testsDone: 3,
    testsTotal: 3,
    practiceDone: 3,
    practiceTotal: 3,
  },
  totalPoints: 90,
  maxPossiblePoints: 100,
  scoreSuccessPercent: 90,
  certificate: null,
  pdfInfrastructureReady: true,
} satisfies CertificateDashboardState;

describe("certificate-view-model", () => {
  it("maps progress view model with ready status and canIssue", () => {
    const vm = mapDashboardStateToCertificateProgressViewModel(baseState);
    expect(vm.status).toBe("ready");
    expect(vm.percentage).toBe(100);
    expect(vm.canIssue).toBe(true);
    expect(vm.issueHref).toBe("/dashboard/certificate");
    expect(vm.continueHref).toBe("/dashboard/course");
    expect(vm.completedRequirements.length).toBeGreaterThan(0);
    expect(vm.remainingRequirements).toHaveLength(0);
  });

  it("maps issued certificate view without forbidden keys", () => {
    const issued: CertificateDashboardState = {
      ...baseState,
      lifecyclePhase: "issued",
      userFlow: "issued",
      pdfInfrastructureReady: true,
      certificate: {
        id: "cert-1",
        certificateNumber: "CE-2026-ABCD",
        issuedAt: "2026-05-01T12:00:00.000Z",
        verifyUrl: "https://app.example/verify/CE-2026-ABCD",
        qrDataUrl: "data:image/png;base64,xx",
        registryStatus: "active",
        pdfReady: true,
      },
    };
    const vm = mapDashboardStateToCertificateViewModel(issued);
    expect(vm?.certificateNumber).toBe("CE-2026-ABCD");
    expect(vm?.status).toBe("valid");
    expect(vm?.pdfDownloadUrl).toBe("/api/certificates/download/cert-1");
    expect(vm?.qrCodeDataUrl).toBeDefined();
    assertNoForbiddenCertificateViewKeys(vm);
  });

  it("maps verify payload to view model messages", () => {
    const vm = mapVerifyPayloadToPresentationModel({
      status: "valid",
      courseTitle: "IB",
      certificateNumber: "CE-1",
      issuedAtLabel: "1 мая 2026 г.",
    });
    expect(vm.status).toBe("valid");
    if (vm.status !== "rate_limited") {
      expect(vm.verificationMessage.length).toBeGreaterThan(10);
    }
  });

  it("omits pdf download url when certificate revoked", () => {
    const issued: CertificateDashboardState = {
      ...baseState,
      lifecyclePhase: "issued",
      userFlow: "issued",
      certificate: {
        id: "cert-revoked",
        certificateNumber: "CE-2026-REVOKED",
        issuedAt: "2026-05-01T12:00:00.000Z",
        verifyUrl: "https://app.example/verify/CE-2026-ABCD",
        qrDataUrl: "data:image/png;base64,xx",
        registryStatus: "revoked",
        revokedAt: "2026-05-02T12:00:00.000Z",
        pdfReady: true,
      },
    };
    const vm = mapDashboardStateToCertificateViewModel(issued);
    expect(vm?.status).toBe("revoked");
    expect(vm?.pdfDownloadUrl).toBeUndefined();
    expect(vm?.verifyUrl).toContain("/verify/CE-");
  });

  it("allows download when infra ready without pending notice", () => {
    const issued: CertificateDashboardState = {
      ...baseState,
      lifecyclePhase: "issued",
      userFlow: "issued",
      pdfInfrastructureReady: true,
      certificate: {
        id: "cert-1",
        certificateNumber: "CE-2026-ABCD",
        issuedAt: "2026-05-01T12:00:00.000Z",
        verifyUrl: "https://app.example/verify/CE-2026-ABCD",
        qrDataUrl: "data:image/png;base64,xx",
        registryStatus: "active",
        pdfReady: true,
      },
    };
    const vm = mapDashboardStateToCertificateViewModel(issued);
    expect(vm?.pdfDownloadUrl).toBe("/api/certificates/download/cert-1");
    expect(vm?.pdfDownloadNotice).toBeUndefined();
  });

  it("shows infra placeholder when PDF fonts unavailable", () => {
    const issued: CertificateDashboardState = {
      ...baseState,
      lifecyclePhase: "issued",
      userFlow: "issued",
      pdfInfrastructureReady: false,
      certificate: {
        id: "cert-1",
        certificateNumber: "CE-2026-ABCD",
        issuedAt: "2026-05-01T12:00:00.000Z",
        verifyUrl: "https://app.example/verify/CE-2026-ABCD",
        qrDataUrl: "data:image/png;base64,xx",
        registryStatus: "active",
        pdfReady: false,
      },
    };
    const vm = mapDashboardStateToCertificateViewModel(issued);
    expect(vm?.pdfDownloadUrl).toBeUndefined();
    expect(vm?.pdfDownloadNotice).toContain("настройки генерации");
  });

  it("maps revoked verify status with minimal public fields", () => {
    const vm = mapVerifyPayloadToPresentationModel({
      status: "revoked",
      certificateNumber: "CE-1",
      courseTitle: "Секретный курс",
      holderName: "Секретное имя",
      revokedAtLabel: "2 мая 2026 г.",
    });
    expect(vm.status).toBe("revoked");
    if (vm.status !== "rate_limited") {
      expect(vm.revokedAt).toBe("2 мая 2026 г.");
      expect(vm.certificateNumber).toBe("CE-1");
      expect(vm.courseTitle).toBeUndefined();
      expect(vm.studentDisplayName).toBeUndefined();
      expect(vm.issuedAt).toBeUndefined();
    }
  });

  it("uses spec copy for not_found and valid titles via messages", () => {
    expect(VERIFY_PUBLIC_MESSAGES.not_found).toBe("Проверьте ID или ссылку.");
    expect(VERIFY_PUBLIC_MESSAGES.expired).toContain("истёк");
    const valid = mapVerifyPayloadToPresentationModel({
      status: "valid",
      certificateNumber: "CE-2026-ABCD1234",
      issuedAtLabel: "1 мая 2026 г.",
      courseTitle: "IB",
    });
    if (valid.status === "valid") {
      expect(valid.certificateNumber).toBe("CE-2026-ABCD1234");
    }
  });
});
