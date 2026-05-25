import type { Metadata } from "next";
import { adminRootMetadata } from "@/lib/admin-metadata";

export const metadata: Metadata = adminRootMetadata;

export const dynamic = "force-dynamic";

/** Корневой layout /admin: без загрузки admin-данных (проверка в (protected)/layout). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
