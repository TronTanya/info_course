import { TechAmbient } from "@/components/effects/tech-ambient";
import { AdminUnauthorizedState, type AdminUnauthorizedVariant } from "@/components/admin/admin-states";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export type AdminAccessGateVariant = AdminUnauthorizedVariant;

export function AdminAccessGate({ variant }: { variant: AdminAccessGateVariant }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <TechAmbient />
      <SiteHeader />
      <div
        id="main-content"
        className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-16"
        tabIndex={-1}
      >
        <AdminUnauthorizedState variant={variant} />
      </div>
      <SiteFooter />
    </div>
  );
}
