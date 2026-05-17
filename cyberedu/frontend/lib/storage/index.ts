import { createLocalStorageService } from "@/lib/storage/local-storage";
import { assertS3StorageConfig } from "@/lib/storage/s3-config";
import type { StorageService } from "@/lib/storage/types";

export type { StorageNamespace, StorageService } from "@/lib/storage/types";
export type { PutObjectInput, StorageProvider, StoredObject } from "@/lib/storage/provider-types";
export { uploadsBaseDir, namespaceDir } from "@/lib/storage/uploads-dir";
export { assertS3StorageConfig, missingS3EnvVars, S3_ENV_KEYS } from "@/lib/storage/s3-config";
export { createS3StorageService, s3ObjectKey } from "@/lib/storage/s3-storage";

export type StorageDriver = "local" | "s3";

/** `UPLOAD_STORAGE_DRIVER` — предпочтительно; `STORAGE_DRIVER` — legacy alias. */
export function getStorageDriver(): StorageDriver {
  const raw =
    process.env.UPLOAD_STORAGE_DRIVER?.trim().toLowerCase() ||
    process.env.STORAGE_DRIVER?.trim().toLowerCase();
  if (raw === "s3") return "s3";
  return "local";
}

let cached: StorageService | null = null;

/**
 * Фабрика хранилища загрузок (practice, avatars, certificates).
 *
 * - **local** (default): `UPLOADS_DIR` + Docker volume `frontend_uploads` — только **single replica**.
 * - **s3**: зарезервировано; env проверяется, runtime отклоняется до реализации.
 */
export function getStorageService(): StorageService {
  if (cached) return cached;
  const driver = getStorageDriver();
  if (driver === "s3") {
    assertS3StorageConfig();
    throw new Error(
      "UPLOAD_STORAGE_DRIVER=s3 is reserved but not implemented. " +
        "Use local with persistent volume for single-node, or complete lib/storage/s3-storage.ts.",
    );
  }
  cached = createLocalStorageService();
  return cached;
}

/** Только для unit-тестов. */
export function resetStorageServiceForTests(): void {
  cached = null;
}
