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
        <div className="ce-animate-in ce-stagger-1">
          <LandingProblem />
        </div>
        <div className="ce-animate-in ce-stagger-2">
          <LandingCourseInside />
        </div>
        <div className="ce-animate-in ce-stagger-3">
          <LandingHowItWorks />
        </div>
        <div className="ce-animate-in ce-stagger-4">
          <LandingPracticeShowcase />
        </div>
        <div className="ce-animate-in ce-stagger-5">
          <LandingAiFeatures />
        </div>
        <div className="ce-animate-in">
          <LandingStats />
        </div>
        <div className="ce-animate-in ce-stagger-1">
          <LandingReviews />
        </div>
        <div className="ce-animate-in ce-stagger-2">
          <LandingCta />
        </div>
      </>
    </MarketingShell>
  );
}
