import type { CertificateLifecyclePhase } from "@/lib/certificate-eligibility";

/** Четыре пользовательских состояния сертификата (verify — отдельная публичная страница). */
export type CertificateUserFlow = "progress" | "ready" | "issued";

export const CERTIFICATE_USER_FLOW_LABELS: Record<CertificateUserFlow, string> = {
  progress: "Прогресс к сертификату",
  ready: "Готов к получению",
  issued: "Сертификат выдан",
};

export function resolveCertificateUserFlow(phase: CertificateLifecyclePhase): CertificateUserFlow {
  if (phase === "issued") return "issued";
  if (phase === "ready_to_issue") return "ready";
  return "progress";
}
