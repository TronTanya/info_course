/**
 * Высокоуровневый контракт object storage (миграция на S3-compatible).
 *
 * Сейчас в коде используется {@link StorageService} (`types.ts`) — namespace + ключ.
 * Адаптер `StorageProvider` появится при реализации S3; local остаётся через LocalStorageService.
 */

export type StoredObject = {
  /** Логический ключ в bucket (без namespace prefix в API провайдера). */
  key: string;
  /** Размер в байтах. */
  size: number;
};

export type PutObjectInput = {
  namespace: string;
  key: string;
  body: Buffer;
  contentType?: string;
};

/** Целевой контракт для S3-compatible backend (не подключён в runtime). */
export interface StorageProvider {
  putObject(input: PutObjectInput): Promise<StoredObject>;
  getObjectUrl(key: string): Promise<string>;
  deleteObject(key: string): Promise<void>;
}
