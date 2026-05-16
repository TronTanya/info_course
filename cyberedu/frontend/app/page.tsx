import type { Metadata } from "next";
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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Главная",
  description:
    "CyberEdu — интерактивный курс по информационной безопасности: лекции, практика, AI-наставник и сертификат.",
};

export default function HomePage() {
  return (
    <MarketingShell>
      <>
        <LandingHero />
        <LandingProblem />
        <LandingCourseInside />
        <LandingHowItWorks />
        <LandingPracticeShowcase />
        <LandingAiFeatures />
        <LandingStats />
        <LandingReviews />
        <LandingCta />
      </>
    </MarketingShell>
  );
}
