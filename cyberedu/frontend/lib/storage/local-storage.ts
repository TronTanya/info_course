import { existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { namespaceDir } from "@/lib/storage/uploads-dir";
import type { StorageNamespace, StorageService } from "@/lib/storage/types";

function nsPath(namespace: StorageNamespace, key: string): string {
  const safeKey = key.replace(/[/\\]/g, "");
  if (!safeKey || safeKey !== key) {
    throw new Error("Invalid storage key");
  }
  return path.join(namespaceDir(namespace), safeKey);
}

export function createLocalStorageService(): StorageService {
  return {
    objectPath(namespace, key) {
      return nsPath(namespace, key);
    },

    async ensureNamespace(namespace) {
      const dir = namespaceDir(namespace);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    },

    async write(namespace, key, data) {
      await this.ensureNamespace(namespace);
      await writeFile(nsPath(namespace, key), data);
    },

    async read(namespace, key) {
      try {
        return await readFile(nsPath(namespace, key));
      } catch {
        return null;
      }
    },

    async exists(namespace, key) {
      return existsSync(nsPath(namespace, key));
    },

    async delete(namespace, key) {
      const p = nsPath(namespace, key);
      if (!existsSync(p)) return false;
      try {
        unlinkSync(p);
        return true;
      } catch {
        return false;
      }
    },

    async listKeys(namespace, prefix) {
      const dir = namespaceDir(namespace);
      if (!existsSync(dir)) return [];
      return readdirSync(dir).filter((name) => name.startsWith(prefix));
    },

    async deleteByPrefix(namespace, prefix) {
      const keys = await this.listKeys(namespace, prefix);
      let removed = 0;
      for (const key of keys) {
        if (await this.delete(namespace, key)) removed += 1;
      }
      return removed;
    },
  };
}
