import type { Metadata } from "next";
import { LandingAiMentor } from "@/components/home/landing-ai-mentor";
import { LandingCertificates } from "@/components/home/landing-certificates";
import { LandingCta } from "@/components/home/landing-cta";
import { LandingHero } from "@/components/home/landing-hero";
import { LandingHowItWorks } from "@/components/home/landing-how-it-works";
import { LandingPracticeLab } from "@/components/home/landing-practice-lab";
import { LandingTrustMetrics } from "@/components/home/landing-trust-metrics";
import { LandingWhatYouLearn } from "@/components/home/landing-what-you-learn";
import { LandingShell } from "@/components/layout/landing-shell";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";
import { JsonLd, homePageJsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  ...buildPublicMetadata({
    title: "CyberEdu — практическая академия кибербезопасности",
    description:
      "Теория, SOC-практики, тесты, AI-наставник и сертификат в одном интерактивном треке. Пошаговая программа по информационной безопасности.",
    path: "/",
  }),
  title: {
    default: "CyberEdu — практическая академия кибербезопасности",
    template: "%s · CyberEdu",
  },
};

export default function HomePage() {
  return (
    <LandingShell>
      <JsonLd data={homePageJsonLd(appUrl)} />
      <LandingHero />
      <LandingTrustMetrics />
      <LandingWhatYouLearn />
      <LandingHowItWorks />
      <LandingPracticeLab />
      <LandingAiMentor />
      <LandingCertificates />
      <LandingCta />
    </LandingShell>
  );
}
