import { NextResponse } from "next/server";
import { siteBaseUrl } from "@/lib/seo/build-page-metadata";

/**
 * RFC 9116 security.txt — контакты без секретов и внутренних путей.
 */
export function GET(): NextResponse {
  const base = siteBaseUrl().replace(/\/$/, "");
  const body = [
    "Contact: mailto:security@cyberedu.local",
    "Expires: 2027-05-22T00:00:00.000Z",
    "Preferred-Languages: ru, en",
    `Policy: ${base}/security`,
    "Acknowledgments: Мы благодарим ответственных исследователей за приватные отчёты.",
    "",
    "# CyberEdu Academy — учебная LMS. Не запрашивайте ключи API и учётные данные в отчётах.",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
