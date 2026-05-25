import { CertificateErrorState } from "@/components/certificate/certificate-states";
import { CERTIFICATE_ERROR_COPY, sanitizeCertificateUserMessage } from "@/lib/certificate-ui-states";

export function CertificatePdfDownloadNotice({ message }: { message: string }) {
  const safe = sanitizeCertificateUserMessage(message, CERTIFICATE_ERROR_COPY.pdf_download.description);
  return <CertificateErrorState kind="pdf_download" compact message={safe} />;
}
