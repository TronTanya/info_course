import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { logoutAction } from "@/lib/actions/logout";
import { cyber } from "@/lib/design-system/cyber";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AdminProfileHeroProps = {
  email: string;
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  memberSinceLabel: string;
  appStatus: "ok" | "degraded";
};

export function AdminProfileHero({
  email,
  displayName,
  initials,
  avatarUrl,
  memberSinceLabel,
  appStatus,
}: AdminProfileHeroProps) {
  return (
    <CyberHero className="ce-admin-security-hero border-primary/25" padding="default" as="header">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 font-bold text-primary ring-1 ring-primary/20 sm:size-16">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="size-3.5" aria-hidden />
                Администратор
              </Badge>
              <Badge variant={appStatus === "ok" ? "outline" : "warning"}>
                {appStatus === "ok" ? "Система OK" : "Внимание"}
              </Badge>
            </div>
            <p className={cyber.monoLabel}>Security Dashboard</p>
            <h1 className="typo-h2 mt-1 text-balance">{displayName}</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{email}</p>
            <p className="typo-caption mt-1">{memberSinceLabel}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/admin">К обзору</Link>
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="lg" className="w-full sm:w-auto">
              Выйти
            </Button>
          </form>
        </div>
      </div>
    </CyberHero>
  );
}
