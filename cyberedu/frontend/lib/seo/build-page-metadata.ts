import type { Metadata } from "next";

export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100").replace(/\/$/, "");
}

export type OgImageConfig = {
  path: string;
  alt: string;
  width?: number;
  height?: number;
};

/** Превью лендинга для Open Graph / Twitter (public/screenshots). */
export const LANDING_OG_PREVIEW: OgImageConfig = {
  path: "/screenshots/01-landing.png",
  alt: "CyberEdu — практический курс по информационной безопасности",
  width: 1280,
  height: 4914,
};

/** Canonical + Open Graph для публичных маркетинговых страниц. */
export function buildPublicMetadata({
  title,
  description,
  path,
  ogImage,
  twitterCard,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: OgImageConfig;
  twitterCard?: "summary" | "summary_large_image";
}): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${siteBaseUrl()}${normalizedPath}`;
  const ogTitle = title.includes("CyberEdu") ? title : `${title} · CyberEdu`;
  const card = twitterCard ?? (ogImage ? "summary_large_image" : "summary");
  const ogImages = ogImage
    ? [
        {
          url: ogImage.path,
          width: ogImage.width,
          height: ogImage.height,
          alt: ogImage.alt,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      type: "website",
      locale: "ru_RU",
      siteName: "CyberEdu",
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card,
      title: ogTitle,
      description,
      ...(ogImages ? { images: [ogImages[0]!.url] } : {}),
    },
  };
}
