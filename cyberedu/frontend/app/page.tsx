import type { Metadata } from "next";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { LandingAiFeatures } from "@/components/home/landing-ai-features";
import { LandingAudience } from "@/components/home/landing-audience";
import { LandingCertificates } from "@/components/home/landing-certificates";
import { LandingCta } from "@/components/home/landing-cta";
import { LandingFaq } from "@/components/home/landing-faq";
import { LandingHero } from "@/components/home/landing-hero";
import { LandingHowItWorks } from "@/components/home/landing-how-it-works";
import { LandingPracticeShowcase } from "@/components/home/landing-practice-showcase";
import { LandingProduction } from "@/components/home/landing-production";
import { LandingScreenshotsPreview } from "@/components/home/landing-screenshots-preview";
import { LandingWhy } from "@/components/home/landing-why";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";
import { JsonLd, homePageJsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  ...buildPublicMetadata({
    title: "CyberEdu — курс по информационной безопасности",
    description:
      "Интерактивный курс по ИБ: лекции, практика, AI-наставник и сертификат с проверкой подлинности.",
    path: "/",
  }),
  title: {
    default: "CyberEdu — курс по информационной безопасности",
    template: "%s · CyberEdu",
  },
};

export default function HomePage() {
  return (
    <MarketingShell>
      <JsonLd data={homePageJsonLd(appUrl)} />
      <div className="flex flex-col gap-16 md:gap-24">
        <LandingHero />
        <ScrollReveal>
          <LandingWhy />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <LandingHowItWorks />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <LandingPracticeShowcase />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <LandingAiFeatures />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <LandingCertificates />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <LandingAudience />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <LandingProduction />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <LandingScreenshotsPreview />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <LandingFaq />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <LandingCta />
        </ScrollReveal>
      </div>
    </MarketingShell>
  );
}
