"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

/** Server action: полный signOut + явный redirect (стабильнее, чем только redirectTo в RSC). */
export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/auth/login");
}
