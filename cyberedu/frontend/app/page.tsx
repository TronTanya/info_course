import type { Metadata } from "next";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { LandingAiFeatures } from "@/components/home/landing-ai-features";
import { LandingCourseInside } from "@/components/home/landing-course-inside";
import { LandingCta } from "@/components/home/landing-cta";
import { LandingHero } from "@/components/home/landing-hero";
import { LandingHowItWorks } from "@/components/home/landing-how-it-works";
import { LandingPracticeShowcase } from "@/components/home/landing-practice-showcase";
import { LandingProblem } from "@/components/home/landing-problem";
import { LandingReviews } from "@/components/home/landing-reviews";
import { LandingStats } from "@/components/home/landing-stats";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";
import { JsonLd, homePageJsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  ...buildPublicMetadata({
    title: "CyberEdu — курс по информационной безопасности",
    description:
      "Интерактивный курс по ИБ: лекции, практика, AI-наставник и сертификат.",
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
        <ScrollReveal delay={0.05}>
          <LandingProblem />
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <LandingCourseInside />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <LandingHowItWorks />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <LandingPracticeShowcase />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <LandingAiFeatures />
        </ScrollReveal>
        <LandingStats />
        <ScrollReveal delay={0.05}>
          <LandingReviews />
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <LandingCta />
        </ScrollReveal>
      </div>
    </MarketingShell>
  );
}
