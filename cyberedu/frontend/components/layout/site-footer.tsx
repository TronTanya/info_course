import Link from "next/link";
import { DOCKER_IMAGE_BUILD_STAMP } from "@/lib/docker-build-stamp";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { authSafe } from "@/lib/auth";

export async function SiteFooter() {
  const session = await authSafe();
  const courseHref = session?.user ? "/dashboard/course" : guestAuthLinks.cabinetLogin;
  return (
    <footer className="ce-app-footer mt-auto">
      <div className="container-page flex flex-col gap-4 py-11 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">CyberEdu</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Учебная платформа. Материалы носят ознакомительный характер; интеграция AI и проверка практики настраиваются на
            следующих этапах.
          </p>
          {DOCKER_IMAGE_BUILD_STAMP !== "local" ? (
            <p className="mt-3 font-mono text-2.75 tabular-nums text-muted-foreground" title="Метка сборки Docker-образа">
              Сборка: {DOCKER_IMAGE_BUILD_STAMP}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link className="hover:text-primary" href={courseHref}>
            {session?.user ? "Курс" : guestAuthLinks.cabinetLabel}
          </Link>
          <Link className="hover:text-primary" href="/reviews">
            Отзывы
          </Link>
          <Link className="hover:text-primary" href="/about">
            Контакты
          </Link>
        </div>
      </div>
    </footer>
  );
}
