import type { Metadata } from "next";
import { LandingActClosing } from "@/components/home/landing-act-closing";
import { LandingActProduct } from "@/components/home/landing-act-product";
import { LandingHero } from "@/components/home/landing-hero";
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
      <LandingActProduct />
      <LandingActClosing />
    </LandingShell>
  );
}
