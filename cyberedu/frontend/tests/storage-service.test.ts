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
import { getStorageService, resetStorageServiceForTests, uploadsBaseDir } from "@/lib/storage";

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
  it("отклоняет S3 до реализации", () => {
    process.env.STORAGE_DRIVER = "s3";
    resetStorageServiceForTests();
    expect(() => getStorageService()).toThrow(/не реализован/i);
    delete process.env.STORAGE_DRIVER;
    resetStorageServiceForTests();
  });
});
