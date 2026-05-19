import type { Metadata } from "next";
import { LandingCertificates } from "@/components/home/landing-certificates";
import { LandingCta } from "@/components/home/landing-cta";
import { LandingHero } from "@/components/home/landing-hero";
import { LandingHowItWorks } from "@/components/home/landing-how-it-works";
import { LandingModules } from "@/components/home/landing-modules";
import { LandingPlatformBenefits } from "@/components/home/landing-platform-benefits";
import { LandingPracticeLab } from "@/components/home/landing-practice-lab";
import { LandingWhatYouLearn } from "@/components/home/landing-what-you-learn";
import { LandingShell } from "@/components/layout/landing-shell";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";
import { JsonLd, homePageJsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  ...buildPublicMetadata({
    title: "CyberEdu — практический курс по кибербезопасности",
    description:
      "Теория, практики, тесты, AI-наставник и сертификат. Пошаговая программа по информационной безопасности в интерактивной платформе.",
    path: "/",
  }),
  title: {
    default: "CyberEdu — практический курс по кибербезопасности",
    template: "%s · CyberEdu",
  },
};

export default function HomePage() {
  return (
    <LandingShell>
      <JsonLd data={homePageJsonLd(appUrl)} />
      <LandingHero />
      <LandingWhatYouLearn />
      <LandingModules />
      <LandingHowItWorks />
      <LandingPlatformBenefits />
      <LandingPracticeLab />
      <LandingCertificates />
      <LandingCta />
    </LandingShell>
  );
}
