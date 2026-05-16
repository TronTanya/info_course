import type { Metadata } from "next";
import { requireAuth } from "@/lib/permissions";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <SiteHeader />
      <div id="main-content" className="flex min-w-0 flex-1 flex-col" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
