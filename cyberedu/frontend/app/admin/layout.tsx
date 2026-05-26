import type { Metadata } from "next";
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
    <div className="ce-admin-route-root flex min-h-screen min-w-0 flex-col">
      <SiteHeader />
      <div id="main-content" className="ce-admin-route flex min-w-0 flex-1 flex-col" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
