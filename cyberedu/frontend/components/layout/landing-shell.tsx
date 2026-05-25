import { TechAmbient } from "@/components/effects/tech-ambient";
import { LandingFooter } from "@/components/home/landing-footer";
import { LandingHeader } from "@/components/home/landing-header";

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ce-app-marketing-main ce-landing-page flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Перейти к содержимому
      </a>
      <TechAmbient variant="landing" />
      <LandingHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="container-page flex min-w-0 flex-1 flex-col gap-20 py-10 sm:gap-24 sm:py-12 md:gap-32 md:py-20"
      >
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
