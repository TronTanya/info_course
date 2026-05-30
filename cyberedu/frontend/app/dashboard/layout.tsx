import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TechAmbient } from "@/components/effects/tech-ambient";
import { StudentNavProvider } from "@/components/layout/student-nav-provider";
import { getContinueModuleIdForUser } from "@/lib/continue-module";
import { requireAuth } from "@/lib/permissions";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  if (session.user.role === "USER" && !session.user.emailVerified) {
    redirect("/auth/verify-email?callbackUrl=/dashboard/profile");
  }

  const seedModuleId =
    session.user.role === "USER" ? await getContinueModuleIdForUser(session.user.id) : null;

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <TechAmbient />
      <StudentNavProvider seedModuleId={seedModuleId}>
        <SiteHeader />
        <div id="main-content" className="flex min-w-0 flex-1 flex-col" tabIndex={-1}>
          {children}
        </div>
      </StudentNavProvider>
      <SiteFooter />
    </div>
  );
}
