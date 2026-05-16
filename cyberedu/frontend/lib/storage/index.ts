import { createLocalStorageService } from "@/lib/storage/local-storage";
import type { StorageService } from "@/lib/storage/types";

export type { StorageNamespace, StorageService } from "@/lib/storage/types";
export { uploadsBaseDir, namespaceDir } from "@/lib/storage/uploads-dir";

export type StorageDriver = "local" | "s3";

export function getStorageDriver(): StorageDriver {
  const raw = process.env.STORAGE_DRIVER?.trim().toLowerCase();
  if (raw === "s3") return "s3";
  return "local";
}

let cached: StorageService | null = null;

/**
 * Фабрика хранилища. Сейчас только local; S3-compatible — позже (STORAGE_DRIVER=s3).
 */
export function getStorageService(): StorageService {
  if (cached) return cached;
  const driver = getStorageDriver();
  if (driver === "s3") {
    throw new Error(
      "STORAGE_DRIVER=s3 не реализован. Используйте local или задайте UPLOADS_DIR + volume.",
    );
  }
  cached = createLocalStorageService();
  return cached;
}

/** Только для unit-тестов. */
export function resetStorageServiceForTests(): void {
  cached = null;
}
