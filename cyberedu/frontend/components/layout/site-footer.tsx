import Link from "next/link";
import { DOCKER_IMAGE_BUILD_STAMP } from "@/lib/docker-build-stamp";

export function SiteFooter() {
  return (
    <footer className="ce-app-footer mt-auto">
      <div className="container-page flex flex-col gap-4 py-11 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">CyberEdu</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Учебная платформа. Материалы носят ознакомительный характер; интеграция AI и проверка практики настраиваются на
            следующих этапах.
          </p>
          <p
            className="mt-3 font-mono text-[11px] tabular-nums text-muted-foreground"
            title="Значение задаётся при docker build; «local» — сборка без Docker"
          >
            Сборка: {DOCKER_IMAGE_BUILD_STAMP}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link className="hover:text-primary" href="/dashboard/course">
            Курс
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
