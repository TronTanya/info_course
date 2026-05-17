import { authSafe } from "@/lib/auth";
import { BrandLogoHeaderLink } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { DOCKER_IMAGE_BUILD_STAMP } from "@/lib/docker-build-stamp";
import { CommandPalette } from "@/components/layout/command-palette";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export async function SiteHeader() {
  const session = await authSafe();
  const role = session?.user?.role;
  const variant = !session?.user ? "guest" : role === "ADMIN" ? "admin" : "user";

  return (
    <header className="ce-app-header sticky top-0 z-40">
      <div className="container-page flex min-w-0 items-center justify-between gap-2 py-3.5 sm:gap-4 sm:py-4">
        <div className="min-w-0 flex-1">
          <BrandLogoHeaderLink className="max-w-full" />
          {process.env.NODE_ENV === "development" ? (
            <p className="mt-1 font-mono text-[10px] leading-none text-muted-foreground/80" title="Метка сборки (только dev)">
              {DOCKER_IMAGE_BUILD_STAMP}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {variant === "admin" ? (
            <Button asChild variant="primary" size="sm" className="shrink-0 shadow-sm">
              <a
                href="/api/admin/users/export"
                title="Список пользователей в CSV (Excel, UTF-8)"
                aria-label="Выгрузить список пользователей в CSV"
              >
                <span className="sm:hidden">CSV</span>
                <span className="hidden sm:inline">Выгрузка CSV</span>
              </a>
            </Button>
          ) : null}
          {variant !== "guest" ? <CommandPalette /> : null}
          <ThemeToggle />
          <SiteHeaderNav variant={variant} />
        </div>
      </div>
    </header>
  );
}
