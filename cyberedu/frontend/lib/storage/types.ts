export type StorageNamespace = "practice" | "avatars" | "certificates";

export type StorageService = {
  /** Абсолютный путь к объекту (local); для S3 — логический key. */
  objectPath(namespace: StorageNamespace, key: string): string;
  ensureNamespace(namespace: StorageNamespace): Promise<void>;
  write(namespace: StorageNamespace, key: string, data: Buffer): Promise<void>;
  read(namespace: StorageNamespace, key: string): Promise<Buffer | null>;
  exists(namespace: StorageNamespace, key: string): Promise<boolean>;
  delete(namespace: StorageNamespace, key: string): Promise<boolean>;
  /** Имена файлов (ключей) в namespace, начинающиеся с prefix. */
  listKeys(namespace: StorageNamespace, prefix: string): Promise<string[]>;
  /** Удаляет все ключи с данным prefix; возвращает число удалённых. */
  deleteByPrefix(namespace: StorageNamespace, prefix: string): Promise<number>;
};
