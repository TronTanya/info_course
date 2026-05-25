import type { Metadata } from "next";
import { LandingAiMentor } from "@/components/home/landing-ai-mentor";
import { LandingCertificates } from "@/components/home/landing-certificates";
import { LandingCta } from "@/components/home/landing-cta";
import { LandingFaq } from "@/components/home/landing-faq";
import { LandingForWhom } from "@/components/home/landing-for-whom";
import { LandingHero } from "@/components/home/landing-hero";
import { LandingHowItWorks } from "@/components/home/landing-how-it-works";
import { LandingModules } from "@/components/home/landing-modules";
import { LandingPlatformSecurity } from "@/components/home/landing-platform-security";
import { LandingPracticeLab } from "@/components/home/landing-practice-lab";
import { LandingTrustStrip } from "@/components/home/landing-trust-strip";
import { LandingReviews } from "@/components/home/landing-reviews";
import { LandingShell } from "@/components/layout/landing-shell";
import { JsonLd, homePageJsonLd } from "@/components/seo/json-ld";
import { buildHomePageMetadata } from "@/lib/seo/home-page-metadata";
import { siteBaseUrl } from "@/lib/seo/build-page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildHomePageMetadata();

export default function HomePage() {
  return (
    <LandingShell>
      <JsonLd data={homePageJsonLd(siteBaseUrl())} />
      <LandingHero />
      <LandingTrustStrip />
      <LandingForWhom />
      <LandingHowItWorks />
      <LandingModules />
      <LandingPracticeLab />
      <LandingAiMentor />
      <LandingPlatformSecurity />
      <LandingCertificates />
      <LandingReviews />
      <LandingFaq />
      <LandingCta />
    </LandingShell>
  );
}
