import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { TechAmbient } from "@/components/effects/tech-ambient";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { resolveAdminAccess } from "@/lib/admin-access";

/**
 * Защищённые страницы админки: проверка роли до рендера {children}.
 * Данные страниц не должны запрашиваться при статусе ≠ admin.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const access = await resolveAdminAccess();

  if (access === "unauthenticated") {
    return <AdminAccessGate variant="login" />;
  }
  if (access === "unauthorized") {
    return <AdminAccessGate variant="forbidden" />;
  }

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
