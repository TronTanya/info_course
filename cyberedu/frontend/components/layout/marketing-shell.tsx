import { TechAmbient } from "@/components/effects/tech-ambient";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageShell } from "@/components/layout/page-shell";

export async function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <TechAmbient />
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="container-page ce-app-marketing-main flex min-w-0 flex-1 flex-col py-12 md:py-20"
      >
        <PageShell>{children}</PageShell>
      </main>
      <SiteFooter />
    </div>
  );
}
