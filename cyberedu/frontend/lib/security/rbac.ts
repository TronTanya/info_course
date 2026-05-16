import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const satisfies Record<string, Role>;

export type Permission =
  | "course:read"
  | "course:write"
  | "admin:users"
  | "admin:content"
  | "admin:submissions"
  | "admin:export"
  | "ai:chat"
  | "ai:adapt";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  USER: ["course:read", "ai:chat", "ai:adapt"],
  ADMIN: [
    "course:read",
    "course:write",
    "admin:users",
    "admin:content",
    "admin:submissions",
    "admin:export",
    "ai:chat",
    "ai:adapt",
  ],
};

export function roleHasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function sessionHasPermission(session: Session | null, permission: Permission): boolean {
  return roleHasPermission(session?.user?.role, permission);
}

export function requireRole(role: Role | undefined, allowed: Role | Role[]): boolean {
  if (!role) return false;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(role);
}
