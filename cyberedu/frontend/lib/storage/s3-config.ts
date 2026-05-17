/** Обязательные переменные при UPLOAD_STORAGE_DRIVER=s3 (реализация — отдельная задача). */
export const S3_ENV_KEYS = [
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_REGION",
] as const;

export type S3StorageConfig = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

export function missingS3EnvVars(): string[] {
  return S3_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

/**
 * Проверяет env для будущего S3 driver. Не означает, что S3 уже работает.
 */
export function assertS3StorageConfig(): S3StorageConfig {
  const missing = missingS3EnvVars();
  if (missing.length > 0) {
    throw new Error(
      `UPLOAD_STORAGE_DRIVER=s3 requires: ${missing.join(", ")}. ` +
        "S3 StorageService is not implemented yet — use UPLOAD_STORAGE_DRIVER=local for single-node.",
    );
  }
  return {
    endpoint: process.env.S3_ENDPOINT!.trim(),
    bucket: process.env.S3_BUCKET!.trim(),
    accessKeyId: process.env.S3_ACCESS_KEY_ID!.trim(),
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!.trim(),
    region: process.env.S3_REGION!.trim(),
  };
}
