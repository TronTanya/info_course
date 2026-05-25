import type { Metadata } from "next";

/** Приватная страница `/dashboard/certificate` — без ФИО и номера сертификата. */
export const CERTIFICATE_PRIVATE_TITLE = "Сертификат — CyberEdu";

export const CERTIFICATE_PRIVATE_DESCRIPTION =
  "Сертификат о прохождении курса CyberEdu.";

/** Публичная verify (лендинг и результат) — нейтральные формулировки. */
export const CERTIFICATE_PUBLIC_VERIFY_TITLE = "Проверка сертификата — CyberEdu";

export const CERTIFICATE_PUBLIC_VERIFY_DESCRIPTION =
  "Проверка подлинности сертификата CyberEdu.";

const PRIVATE_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

const PUBLIC_VERIFY_RESULT_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

const PUBLIC_VERIFY_LANDING_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
};

/** Нейтральный OG/Twitter — без данных студента и без CE-номера. */
function buildPublicVerifyOpenGraph(): NonNullable<Metadata["openGraph"]> {
  return {
    title: CERTIFICATE_PUBLIC_VERIFY_TITLE,
    description: CERTIFICATE_PUBLIC_VERIFY_DESCRIPTION,
    type: "website",
  };
}

function buildPublicVerifyTwitter(): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary",
    title: CERTIFICATE_PUBLIC_VERIFY_TITLE,
    description: CERTIFICATE_PUBLIC_VERIFY_DESCRIPTION,
  };
}

export function buildCertificatePrivatePageMetadata(): Metadata {
  return {
    title: { absolute: CERTIFICATE_PRIVATE_TITLE },
    description: CERTIFICATE_PRIVATE_DESCRIPTION,
    robots: PRIVATE_ROBOTS,
    openGraph: {
      title: CERTIFICATE_PRIVATE_TITLE,
      description: CERTIFICATE_PRIVATE_DESCRIPTION,
      type: "website",
    },
  };
}

/** Лендинг ввода номера (`/certificate/verify`, редирект с `/verify`). */
export function buildCertificatePublicVerifyLandingMetadata(): Metadata {
  return {
    title: { absolute: CERTIFICATE_PUBLIC_VERIFY_TITLE },
    description: CERTIFICATE_PUBLIC_VERIFY_DESCRIPTION,
    robots: PUBLIC_VERIFY_LANDING_ROBOTS,
    openGraph: buildPublicVerifyOpenGraph(),
    twitter: buildPublicVerifyTwitter(),
  };
}

/**
 * Страница результата проверки (`/verify/CE-…`, legacy `/certificate/verify/…`).
 * Не включает номер сертификата, статус valid/revoked и ФИО — только общий текст.
 */
export function buildCertificatePublicVerifyResultMetadata(): Metadata {
  return {
    title: { absolute: CERTIFICATE_PUBLIC_VERIFY_TITLE },
    description: CERTIFICATE_PUBLIC_VERIFY_DESCRIPTION,
    robots: PUBLIC_VERIFY_RESULT_ROBOTS,
    openGraph: buildPublicVerifyOpenGraph(),
    twitter: buildPublicVerifyTwitter(),
  };
}
