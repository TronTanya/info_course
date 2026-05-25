import Link from "next/link";
import { CertificateVerifyLookupForm } from "@/components/certificate/certificate-verify-lookup-form";
import { buildCertificatePublicVerifyLandingMetadata } from "@/lib/certificate-metadata";
import { Button } from "@/components/ui/button";

export const metadata = buildCertificatePublicVerifyLandingMetadata();

export default function CertificateVerifyLandingPage() {
  return (
    <div className="ce-cert-verify-page flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">CyberEdu Academy</p>
        <h1 className="text-center font-display text-2xl font-semibold text-foreground">Проверка сертификата</h1>
        <p className="text-center text-sm text-muted-foreground">
          Введите ID из QR или PDF — формат CE-ГОД-…
        </p>
        <CertificateVerifyLookupForm />
        <Button variant="ghost" asChild>
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </div>
  );
}
