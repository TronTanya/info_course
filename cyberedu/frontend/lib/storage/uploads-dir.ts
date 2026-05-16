import path from "node:path";
import type { StorageNamespace } from "@/lib/storage/types";

/**
 * Корень пользовательских загрузок.
 * Docker: UPLOADS_DIR=/app/uploads + volume `frontend_uploads`.
 * Локально без env: `<cwd>/uploads`.
 */
export function uploadsBaseDir(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "uploads");
}

export function namespaceDir(namespace: StorageNamespace): string {
  return path.join(uploadsBaseDir(), namespace);
}
