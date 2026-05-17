import type { S3StorageConfig } from "@/lib/storage/s3-config";
import type { StorageNamespace, StorageService } from "@/lib/storage/types";

/**
 * Skeleton S3-compatible {@link StorageService}.
 *
 * **STATUS: NOT IMPLEMENTED** — не включать в production.
 * Фабрика `getStorageService()` отклоняет driver=s3 до вызова этой функции.
 * Файл существует как точка расширения и для будущих unit/integration тестов с MinIO.
 */
export function assertS3NotImplemented(config: S3StorageConfig): never {
  throw new Error(
    "S3 StorageService is not implemented. Use UPLOAD_STORAGE_DRIVER=local (single replica + volume). " +
      `Bucket configured: ${Boolean(config.bucket)}; endpoint set: ${Boolean(config.endpoint)}; region set: ${Boolean(config.region)}.`,
  );
}

export function createS3StorageService(config: S3StorageConfig): StorageService {
  const reject = (): never => assertS3NotImplemented(config);

  return {
    objectPath: reject,
    ensureNamespace: reject,
    write: reject,
    read: reject,
    exists: reject,
    delete: reject,
    listKeys: reject,
    deleteByPrefix: reject,
  };
}

/** @internal Зарезервировано для будущего mapping namespace → key prefix. */
export function s3ObjectKey(namespace: StorageNamespace, key: string): string {
  return `${namespace}/${key}`;
}
