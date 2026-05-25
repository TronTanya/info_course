import type { Metadata } from "next";
import { buildPublicMetadata, LANDING_OG_PREVIEW } from "@/lib/seo/build-page-metadata";

export const HOME_PAGE_TITLE = "CyberEdu — практический курс по информационной безопасности";

export const HOME_PAGE_DESCRIPTION =
  "Изучайте основы информационной безопасности, проходите практические лаборатории, закрепляйте знания тестами и получайте сертификат.";

/** Metadata главной страницы (App Router static export). */
export function buildHomePageMetadata(): Metadata {
  return {
    ...buildPublicMetadata({
      title: HOME_PAGE_TITLE,
      description: HOME_PAGE_DESCRIPTION,
      path: "/",
      ogImage: LANDING_OG_PREVIEW,
    }),
    title: {
      default: HOME_PAGE_TITLE,
      template: "%s · CyberEdu",
    },
  };
}
