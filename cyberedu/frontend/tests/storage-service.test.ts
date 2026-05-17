import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  deletePracticeFile,
  findStoredPracticeFile,
  practiceUploadDir,
  savePracticeFile,
} from "@/lib/practice-files";
import {
  avatarUploadDir,
  deleteUserAvatarFiles,
  findUserAvatarFile,
  saveUserAvatarFile,
} from "@/lib/avatar-upload";
import { certificateFileKey, readCertificatePdfFile, writeCertificatePdfFile } from "@/lib/certificate";
import {
  getStorageService,
  missingS3EnvVars,
  resetStorageServiceForTests,
  uploadsBaseDir,
} from "@/lib/storage";

let tempRoot = "";

beforeEach(() => {
  tempRoot = mkdtempSync(join(tmpdir(), "cyberedu-uploads-"));
  process.env.UPLOADS_DIR = tempRoot;
  resetStorageServiceForTests();
});

afterEach(() => {
  if (tempRoot) {
    rmSync(tempRoot, { recursive: true, force: true });
    tempRoot = "";
  }
  delete process.env.UPLOADS_DIR;
  resetStorageServiceForTests();
});

describe("storage/local — practice", () => {
  it("сохраняет и находит файл по submissionId", async () => {
    const buf = Buffer.from("%PDF-1.4 practice");
    await savePracticeFile("sub-1", "pdf", buf);
    expect(practiceUploadDir()).toBe(join(uploadsBaseDir(), "practice"));
    const found = await findStoredPracticeFile("sub-1");
    expect(found).not.toBeNull();
    expect(found!.ext).toBe("pdf");
    const disk = await getStorageService().read("practice", "sub-1.pdf");
    expect(disk?.equals(buf)).toBe(true);
  });

  it("удаляет practice-файлы по prefix", async () => {
    await savePracticeFile("sub-del", "txt", Buffer.from("hello"));
    expect(await findStoredPracticeFile("sub-del")).not.toBeNull();
    const n = await deletePracticeFile("sub-del");
    expect(n).toBe(1);
    expect(await findStoredPracticeFile("sub-del")).toBeNull();
  });
});

describe("storage/local — avatars", () => {
  it("заменяет старый аватар при новой загрузке", async () => {
    const userId = "user-avatar-1";
    await saveUserAvatarFile(userId, "png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]));
    await saveUserAvatarFile(
      userId,
      "jpg",
      Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]),
    );
    expect(avatarUploadDir()).toBe(join(uploadsBaseDir(), "avatars"));
    const keys = await getStorageService().listKeys("avatars", `${userId}.`);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe(`${userId}.jpg`);
    const found = await findUserAvatarFile(userId);
    expect(found?.ext).toBe("jpg");
  });

  it("удаляет все варианты аватара пользователя", async () => {
    const userId = "user-avatar-2";
    const storage = getStorageService();
    await storage.write("avatars", `${userId}.png`, Buffer.from("x"));
    await storage.write("avatars", `${userId}.webp`, Buffer.from("y"));
    await deleteUserAvatarFiles(userId);
    expect(await findUserAvatarFile(userId)).toBeNull();
  });
});

describe("storage/local — certificates", () => {
  it("записывает и читает PDF", async () => {
    const id = "cert-abc";
    const pdf = Buffer.from("%PDF-1.4 cert");
    await writeCertificatePdfFile(id, pdf);
    const read = await readCertificatePdfFile(id);
    expect(read?.equals(pdf)).toBe(true);
    expect(await getStorageService().exists("certificates", certificateFileKey(id))).toBe(true);
    await getStorageService().delete("certificates", certificateFileKey(id));
    expect(await readCertificatePdfFile(id)).toBeNull();
  });
});

describe("storage driver", () => {
  const s3EnvBackup: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [k, v] of Object.entries(s3EnvBackup)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    delete process.env.UPLOAD_STORAGE_DRIVER;
    delete process.env.STORAGE_DRIVER;
    resetStorageServiceForTests();
  });

  function setS3Env(partial: Record<string, string>) {
    for (const key of [
      "UPLOAD_STORAGE_DRIVER",
      "STORAGE_DRIVER",
      "S3_ENDPOINT",
      "S3_BUCKET",
      "S3_ACCESS_KEY_ID",
      "S3_SECRET_ACCESS_KEY",
      "S3_REGION",
    ] as const) {
      if (!(key in s3EnvBackup)) s3EnvBackup[key] = process.env[key];
    }
    Object.assign(process.env, partial);
    resetStorageServiceForTests();
  }

  it("отклоняет S3 до реализации (STORAGE_DRIVER alias)", () => {
    setS3Env({
      STORAGE_DRIVER: "s3",
      S3_ENDPOINT: "https://s3.example.com",
      S3_BUCKET: "cyberedu",
      S3_ACCESS_KEY_ID: "key",
      S3_SECRET_ACCESS_KEY: "secret",
      S3_REGION: "us-east-1",
    });
    expect(() => getStorageService()).toThrow(/not implemented/i);
  });

  it("отклоняет S3 при полном env (UPLOAD_STORAGE_DRIVER)", () => {
    setS3Env({
      UPLOAD_STORAGE_DRIVER: "s3",
      S3_ENDPOINT: "https://minio.example:9000",
      S3_BUCKET: "uploads",
      S3_ACCESS_KEY_ID: "minio",
      S3_SECRET_ACCESS_KEY: "minio123",
      S3_REGION: "us-east-1",
    });
    expect(() => getStorageService()).toThrow(/not implemented/i);
  });

  it("требует S3 env при driver=s3", () => {
    setS3Env({ UPLOAD_STORAGE_DRIVER: "s3" });
    expect(missingS3EnvVars().length).toBeGreaterThan(0);
    expect(() => getStorageService()).toThrow(/S3_ENDPOINT/);
  });
});
