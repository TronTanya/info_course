import type { LucideIcon } from "lucide-react";
import { ClipboardList, Download, Plus, Shield } from "lucide-react";

import { ADMIN_EXPORT_ANCHOR, ADMIN_USERS_EXPORT_PATH } from "@/lib/admin-export-types";

export { ADMIN_EXPORT_ANCHOR, ADMIN_USERS_EXPORT_PATH };

/** Якорь на блок audit на главной админки (`/admin`). */
export const ADMIN_AUDIT_LOG_ANCHOR = "#admin-audit-log" as const;

/** Якорь на подозрительные события на главной админки. */
export const ADMIN_SECURITY_WATCH_ANCHOR = "#security-watch" as const;

export type AdminHeaderQuickAction = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Скачивание через API (не Next route). */
  external?: boolean;
};

/** Быстрые действия control center — только существующие маршруты. */
export const ADMIN_HEADER_QUICK_ACTIONS: readonly AdminHeaderQuickAction[] = [
  {
    id: "create-module",
    href: "/admin/modules/new",
    label: "Создать модуль",
    icon: Plus,
  },
  {
    id: "review-practices",
    href: "/admin/submissions?filter=pending",
    label: "Проверить практики",
    icon: ClipboardList,
  },
  {
    id: "export-csv",
    href: `/admin${ADMIN_EXPORT_ANCHOR}`,
    label: "Экспорт",
    icon: Download,
  },
  {
    id: "security-watch",
    href: ADMIN_SECURITY_WATCH_ANCHOR,
    label: "Безопасность",
    icon: Shield,
  },
] as const;

export function getAdminHeaderQuickActions(): AdminHeaderQuickAction[] {
  return [...ADMIN_HEADER_QUICK_ACTIONS];
}
