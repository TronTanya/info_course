import { redirect } from "next/navigation";
import { CertificateVerifyView } from "@/components/certificate/certificate-verify-view";
import { buildCertificatePublicVerifyResultMetadata } from "@/lib/certificate-metadata";
import { runPublicCertificateVerify } from "@/lib/certificate-verify-page";
import {
  certificateVerifyPath,
  normalizePublicCertificateNumber,
} from "@/lib/certificate-verify-url";

type Props = { params: Promise<{ verificationCode: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildCertificatePublicVerifyResultMetadata();
}

export default async function VerifyCertificateLegacyPage({ params }: Props) {
  const raw = (await params).verificationCode;
  const identifier = decodeURIComponent(raw);

  const asNumber = normalizePublicCertificateNumber(identifier);
  if (asNumber) {
    redirect(certificateVerifyPath(asNumber));
  }

  const result = await runPublicCertificateVerify(identifier, "/certificate/verify");
  return <CertificateVerifyView result={result} />;
}
