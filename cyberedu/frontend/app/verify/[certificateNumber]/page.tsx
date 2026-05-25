import { CertificateVerifyView } from "@/components/certificate/certificate-verify-view";
import { buildCertificatePublicVerifyResultMetadata } from "@/lib/certificate-metadata";
import { runPublicCertificateVerify } from "@/lib/certificate-verify-page";

type Props = { params: Promise<{ certificateNumber: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildCertificatePublicVerifyResultMetadata();
}

export default async function VerifyByCertificateNumberPage({ params }: Props) {
  const raw = (await params).certificateNumber;
  const identifier = decodeURIComponent(raw);
  const result = await runPublicCertificateVerify(identifier, "/verify");
  return <CertificateVerifyView result={result} />;
}
