import { assertAdminDataAccess } from "@/lib/admin-access";

/** Вызовите первой строкой в server page под `app/admin/(protected)/*`. */
export async function ensureAdminPageAccess() {
  return assertAdminDataAccess();
}
