import type { Metadata } from "next";
import { TechAmbient } from "@/components/effects/tech-ambient";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buildDashboardRootMetadata } from "@/lib/dashboard-metadata";

export const metadata: Metadata = buildDashboardRootMetadata();

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <TechAmbient />
      <SiteHeader />
      <main id="main-content" className="flex min-h-0 min-w-0 flex-1 flex-col" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
