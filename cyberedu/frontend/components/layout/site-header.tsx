import { authSafe } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BrandLogoHeaderLink } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/layout/command-palette";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { AdminHeaderQuickNav } from "@/components/layout/admin-header-quick-nav";
import { StudentHeaderQuickNav } from "@/components/layout/student-header-quick-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export async function SiteHeader() {
  const session = await authSafe();
  const role = session?.user?.role;
  const variant = !session?.user ? "guest" : role === "ADMIN" ? "admin" : "user";
  let profile: { avatarUrl: string | null } | null = null;
  if (session?.user?.id != null) {
    try {
      profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { avatarUrl: true },
      });
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("[SiteHeader] БД недоступна — аватар не загружен:", msg);
      } else {
        throw e;
      }
    }
  }
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        avatarUrl: profile?.avatarUrl ?? null,
      }
    : null;

  return (
    <header className="ce-app-header sticky top-0 z-40 border-b border-primary/15">
      <div className="container-page flex min-w-0 items-center gap-2 py-3.5 sm:gap-3 sm:py-4">
        <div className="min-w-0 shrink-0 sm:max-w-[14rem]">
          <BrandLogoHeaderLink className="max-w-full" />
        </div>
        {variant === "user" ? <StudentHeaderQuickNav /> : null}
        {variant === "admin" ? <AdminHeaderQuickNav /> : null}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {variant === "admin" ? (
            <Button asChild variant="primary" size="sm" className="hidden shrink-0 shadow-sm lg:inline-flex">
              <a
                href="/admin#admin-export"
                title="Экспорт CSV: студенты, прогресс, отправки, сертификаты"
                aria-label="Открыть панель экспорта CSV"
              >
                <span className="hidden xl:inline">Выгрузка CSV</span>
                <span className="xl:hidden">CSV</span>
              </a>
            </Button>
          ) : null}
          {variant !== "guest" ? <CommandPalette isAdmin={variant === "admin"} /> : null}
          <ThemeToggle />
          <SiteHeaderNav variant={variant} user={user} />
        </div>
      </div>
    </header>
  );
}
