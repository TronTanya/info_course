import type { CertificateDashboardState } from "@/lib/certificate";
import type { DashboardStepMetrics } from "@/lib/dashboard-ui";
import { buildCertificateRequirementRows, type CertificateRequirementRow } from "@/lib/certificate-eligibility";

export type { CertificateRequirementId, CertificateRequirementRow } from "@/lib/certificate-eligibility";
export {
  CERTIFICATE_ELIGIBILITY_RULE,
  buildCertificateRequirementRows,
  buildCertificateRemainingItems,
  resolveCertificateLifecyclePhase,
  CERTIFICATE_LIFECYCLE_LABELS,
} from "@/lib/certificate-eligibility";

/** @deprecated Используйте buildCertificateRequirementRows — порог баллов не входит в server-side eligibility. */
export const CERTIFICATE_MIN_SCORE_PERCENT = 70;

export function buildCertificateRequirements(
  state: CertificateDashboardState,
  metrics: DashboardStepMetrics,
): CertificateRequirementRow[] {
  return buildCertificateRequirementRows({
    completedModules: state.completedModules,
    totalModules: state.totalModules,
    courseCompleted: state.courseCompleted,
    metrics,
  });
}
