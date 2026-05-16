/** Готовые аватары CyberEdu в `public/avatars/` — публичные пути для `Profile.avatarUrl`. */
export const PRESET_AVATAR_PATHS = [
  "/avatars/avatar-shield.svg",
  "/avatars/avatar-robot.svg",
  "/avatars/avatar-cat.svg",
  "/avatars/avatar-terminal.svg",
  "/avatars/avatar-lock.svg",
  "/avatars/avatar-cosmo.svg",
  "/avatars/avatar-laptop.svg",
  "/avatars/avatar-fox.svg",
  "/avatars/avatar-student.svg",
  "/avatars/avatar-ai.svg",
] as const;

/** Старые URL из ранних версий — файлы сохранены для совместимости. */
export const LEGACY_PRESET_AVATAR_PATHS = [
  "/avatars/preset-01.svg",
  "/avatars/preset-02.svg",
  "/avatars/preset-03.svg",
  "/avatars/preset-04.svg",
  "/avatars/preset-05.svg",
  "/avatars/preset-06.svg",
  "/avatars/preset-07.svg",
  "/avatars/preset-08.svg",
  "/avatars/preset-09.svg",
  "/avatars/preset-10.svg",
] as const;

export type PresetAvatarPath = (typeof PRESET_AVATAR_PATHS)[number];

/** Пресеты текущего набора (для выбора в UI). */
export function isPresetAvatarPath(value: string): value is PresetAvatarPath {
  return (PRESET_AVATAR_PATHS as readonly string[]).includes(value);
}

/** Любой встроенный пресет (новый или legacy). */
export function isBuiltinPresetAvatarUrl(value: string): boolean {
  return (
    (PRESET_AVATAR_PATHS as readonly string[]).includes(value) ||
    (LEGACY_PRESET_AVATAR_PATHS as readonly string[]).includes(value)
  );
}

export const AVATAR_PICKER_ITEMS: readonly { id: string; path: PresetAvatarPath; label: string }[] = [
  { id: "shield", path: "/avatars/avatar-shield.svg", label: "Зелёный щит с глазами" },
  { id: "robot", path: "/avatars/avatar-robot.svg", label: "Робот-наставник" },
  { id: "cat", path: "/avatars/avatar-cat.svg", label: "Кибер-кот" },
  { id: "terminal", path: "/avatars/avatar-terminal.svg", label: "Терминал с улыбкой" },
  { id: "lock", path: "/avatars/avatar-lock.svg", label: "Замок с мягким свечением" },
  { id: "cosmo", path: "/avatars/avatar-cosmo.svg", label: "Космонавт-студент" },
  { id: "laptop", path: "/avatars/avatar-laptop.svg", label: "Ноутбук-защитник" },
  { id: "fox", path: "/avatars/avatar-fox.svg", label: "Лиса в дружелюбном стиле" },
  { id: "student", path: "/avatars/avatar-student.svg", label: "Пиксельный студент" },
  { id: "ai", path: "/avatars/avatar-ai.svg", label: "AI-помощник" },
];

/** Загруженный пользователем файл — единый URL, раздаётся с проверкой сессии. */
export const CUSTOM_AVATAR_API_PATH = "/api/profile/avatar/image" as const;

export function isCustomAvatarApiPath(value: string | null | undefined): boolean {
  return value === CUSTOM_AVATAR_API_PATH;
}

export function isAllowedStoredAvatarUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (isBuiltinPresetAvatarUrl(v) || isCustomAvatarApiPath(v)) return true;
  return /^https?:\/\/.+/i.test(v);
}

/** Legacy `/avatars/preset-NN.svg` → актуальный путь набора CyberEdu. */
export function canonicalizeBuiltinPreset(url: string | null | undefined): string | null {
  if (!url) return null;
  if (isPresetAvatarPath(url)) return url;
  const idx = (LEGACY_PRESET_AVATAR_PATHS as readonly string[]).indexOf(url);
  if (idx >= 0) return PRESET_AVATAR_PATHS[idx] ?? null;
  return null;
}
