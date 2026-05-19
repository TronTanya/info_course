import type { Metadata } from "next";
import { TechAmbient } from "@/components/effects/tech-ambient";
import { requireAdmin } from "@/lib/permissions";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <TechAmbient />
      <SiteHeader />
      <div id="main-content" className="flex min-w-0 flex-1 flex-col" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
