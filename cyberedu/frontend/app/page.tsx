import type { Metadata } from "next";
import { LandingHero } from "@/components/home/landing-hero";
import { LandingLearningPath } from "@/components/home/landing-learning-path";
import { LandingMetrics } from "@/components/home/landing-metrics";
import { LandingCta } from "@/components/home/landing-cta";
import { LandingPracticeLab } from "@/components/home/landing-practice-lab";
import { LandingShell } from "@/components/layout/landing-shell";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";
import { JsonLd, homePageJsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  ...buildPublicMetadata({
    title: "CyberEdu — кибербезопасность через практику",
    description:
      "Интерактивная платформа: уроки, тесты, лабораторные задания и сценарии защиты инфраструктуры.",
    path: "/",
  }),
  title: {
    default: "CyberEdu — кибербезопасность через практику",
    template: "%s · CyberEdu",
  },
};

export default function HomePage() {
  return (
    <LandingShell>
      <JsonLd data={homePageJsonLd(appUrl)} />
      <LandingHero />
      <LandingMetrics />
      <LandingLearningPath />
      <LandingPracticeLab />
      <LandingCta />
    </LandingShell>
  );
}
