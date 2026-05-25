import type { CertificateDashboardState } from "@/lib/certificate";
import type { CertificateViewModel } from "@/types/certificate-view-model";
import { CertificatePreview, type CertificatePreviewVariant } from "@/components/certificate/certificate-preview";
import {
  mapCertificatePreviewFromDashboardState,
  mapCertificatePreviewFromViewModel,
} from "@/lib/certificate-preview-model";

export type CertificatePreviewCardProps = {
  state?: CertificateDashboardState;
  view?: CertificateViewModel;
  variant?: CertificatePreviewVariant;
  className?: string;
};

/** Обёртка: dashboard state или issued view model → {@link CertificatePreview}. */
export function CertificatePreviewCard({ state, view, variant = "dark", className }: CertificatePreviewCardProps) {
  const model = view
    ? mapCertificatePreviewFromViewModel(view)
    : state
      ? mapCertificatePreviewFromDashboardState(state)
      : null;

  if (!model) return null;

  return <CertificatePreview model={model} variant={variant} className={className} />;
}
