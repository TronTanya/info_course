import type { Metadata } from "next";

export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100").replace(/\/$/, "");
}

/** Canonical + Open Graph для публичных маркетинговых страниц. */
export function buildPublicMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${siteBaseUrl()}${normalizedPath}`;
  const ogTitle = title.includes("CyberEdu") ? title : `${title} · CyberEdu`;

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
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description,
    },
  };
}
