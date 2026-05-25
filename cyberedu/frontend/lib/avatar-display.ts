import {
  canonicalizeBuiltinPreset,
  CUSTOM_AVATAR_API_PATH,
  isBuiltinPresetAvatarUrl,
  isCustomAvatarApiPath,
} from "@/lib/avatar-presets";
import { isSafeExternalHttpsUrl } from "@/lib/security/sanitize";

/** URL для `<img src>` из значения `Profile.avatarUrl`. */
export function resolveAvatarImageSrc(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl?.trim()) return null;
  const raw = avatarUrl.trim();
  if (isCustomAvatarApiPath(raw)) return CUSTOM_AVATAR_API_PATH;
  const preset = canonicalizeBuiltinPreset(raw);
  if (preset) return preset;
  if (isBuiltinPresetAvatarUrl(raw)) return raw;
  if (raw.startsWith("https://") && isSafeExternalHttpsUrl(raw)) return raw;
  return null;
}

export function userInitials(name?: string | null, email?: string | null): string {
  const source = (name?.trim() || email?.split("@")[0] || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
