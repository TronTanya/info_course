import type { CertificateDashboardState } from "@/lib/certificate";
import {
  mapDashboardStateToCertificateProgressViewModel,
  mapDashboardStateToCertificateViewModel,
} from "@/lib/certificate-view-model";
import { CertificateIssuedPage } from "@/components/certificate/certificate-issued-page";
import { CertificateNotFoundState } from "@/components/certificate/certificate-not-found-state";
import { CertificateFlowProgress } from "@/components/certificate/certificate-flow-progress";
import { CertificateFlowReady } from "@/components/certificate/certificate-flow-ready";

export function CertificatePageFlow({ state }: { state: CertificateDashboardState }) {
  const progress = mapDashboardStateToCertificateProgressViewModel(state);

  switch (state.userFlow) {
    case "issued": {
      const certificate = mapDashboardStateToCertificateViewModel(state);
      if (!certificate) {
        return <CertificateNotFoundState />;
      }
      return <CertificateIssuedPage view={certificate} />;
    }
    case "ready":
      return <CertificateFlowReady progress={progress} courseId={state.courseId} previewState={state} />;
    case "progress":
    default:
      return <CertificateFlowProgress progress={progress} />;
  }
}
