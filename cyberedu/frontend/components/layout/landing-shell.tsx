import { TechAmbient } from "@/components/effects/tech-ambient";
import { LandingFooter } from "@/components/home/landing-footer";
import { LandingHeader } from "@/components/home/landing-header";

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ce-app-marketing-main flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <TechAmbient />
      <LandingHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="container-page flex min-w-0 flex-1 flex-col gap-16 py-10 md:gap-20 md:py-14"
      >
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
