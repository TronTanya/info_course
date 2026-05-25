import { describe, expect, it } from "vitest";
import type { CertificateDashboardState } from "@/lib/certificate";
import {
  CERTIFICATE_PREVIEW_PLACEHOLDERS,
  mapCertificatePreviewFromDashboardState,
  mapCertificatePreviewFromViewModel,
} from "@/lib/certificate-preview-model";
import type { CertificateViewModel } from "@/types/certificate-view-model";

const baseState = {
  courseId: "c1",
  courseTitle: "Основы информационной безопасности",
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

const issuedView: CertificateViewModel = {
  id: "cert-1",
  certificateNumber: "CE-2026-ABCD",
  courseTitle: "Основы информационной безопасности",
  studentDisplayName: "Иванов Иван",
  issuedAt: "2026-05-01T12:00:00.000Z",
  verifyUrl: "https://app.example/verify/CE-2026-ABCD",
  status: "valid",
  qrCodeDataUrl: "data:image/png;base64,xx",
  pdfDownloadUrl: "/api/certificates/download/cert-1",
};

describe("certificate-preview-model", () => {
  it("uses placeholders before issue", () => {
    const model = mapCertificatePreviewFromDashboardState(baseState);
    expect(model.mode).toBe("placeholder");
    expect(model.status).toBe("preview");
    expect(model.studentName).toBe("Иванов Иван");
    expect(model.certificateIdLabel).toBe(CERTIFICATE_PREVIEW_PLACEHOLDERS.certificateId);
    expect(model.verifyHref).toBeNull();
    expect(model.qrDataUrl).toBeNull();
  });

  it("falls back to placeholder name when display name empty", () => {
    const model = mapCertificatePreviewFromDashboardState({
      ...baseState,
      studentDisplayName: "",
    });
    expect(model.studentName).toBe(CERTIFICATE_PREVIEW_PLACEHOLDERS.studentName);
  });

  it("maps issued dashboard state with QR and verify link", () => {
    const model = mapCertificatePreviewFromDashboardState({
      ...baseState,
      certificate: {
        id: "cert-1",
        certificateNumber: "CE-2026-ABCD",
        issuedAt: "2026-05-01T12:00:00.000Z",
        verifyUrl: "https://app.example/verify/CE-2026-ABCD",
        qrDataUrl: "data:image/png;base64,xx",
        registryStatus: "active",
        pdfReady: true,
      },
    });
    expect(model.mode).toBe("issued");
    expect(model.status).toBe("valid");
    expect(model.certificateIdLabel).toBe("CE-2026-ABCD");
    expect(model.verifyHref).toContain("/verify/");
    expect(model.qrDataUrl).toBeTruthy();
  });

  it("maps revoked status from view model", () => {
    const model = mapCertificatePreviewFromViewModel({
      ...issuedView,
      status: "revoked",
      revokedAt: "2026-06-01T12:00:00.000Z",
    });
    expect(model.status).toBe("revoked");
  });
});
