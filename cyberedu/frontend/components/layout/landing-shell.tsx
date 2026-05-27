import { TechAmbient } from "@/components/effects/tech-ambient";
import { LandingFooter } from "@/components/home/landing-footer";
import { LandingHeader } from "@/components/home/landing-header";
import { LandingStickyCta } from "@/components/home/landing-sticky-cta";

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ce-app-marketing-main flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <TechAmbient />
      <LandingHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="container-page flex min-w-0 flex-1 flex-col gap-16 pb-24 sm:gap-20 sm:pb-12 md:gap-28 md:pb-16 lg:pb-16"
      >
        {children}
      </main>
      <LandingFooter />
      <LandingStickyCta />
    </div>
  );
}
