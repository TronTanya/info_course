import { notFound } from "next/navigation";
import type { Session } from "next-auth";
import { requireAuth } from "@/lib/permissions";

/**
 * UI Kit: только ADMIN (в т.ч. в production — студенты и другие роли получают 404).
 */
export async function assertUiKitAccess(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    notFound();
  }
  return session;
}
