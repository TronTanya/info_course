"use client";

import type { RefObject } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AVATAR_PICKER_ITEMS } from "@/lib/avatar-presets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AvatarPickerPersistMode = "form" | "api";

export type AvatarPickerProps = {
  disabled?: boolean;
  initials: string;
  /** URL из профиля (до сохранения формы). */
  profileAvatarUrl: string | null;
  selectedPreset: string | null;
  clearAvatar: boolean;
  filePreview: string | null;
  previewDisplay: string | null;
  onPresetSelect: (path: string) => void;
  onRemoveAvatar: () => void;
  onFileChange: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  fileFieldError?: string;
  /** `form` — только UI, сохранение через родительскую форму. `api` — PATCH/POST и `router.refresh()`. */
  persistMode?: AvatarPickerPersistMode;
  /** После успешного сохранения через API. */
  onApiPersisted?: () => void;
};

export function AvatarPicker({
  disabled,
  initials,
  profileAvatarUrl,
  selectedPreset,
  clearAvatar,
  filePreview,
  previewDisplay,
  onPresetSelect,
  onRemoveAvatar,
  onFileChange,
  fileInputRef,
  fileFieldError,
  persistMode = "form",
  onApiPersisted,
}: AvatarPickerProps) {
  const router = useRouter();
  const [apiBusy, setApiBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const busy = Boolean(disabled || apiBusy);

  async function persistPresetApi(path: string) {
    setApiError(null);
    setApiBusy(true);
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: path }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setApiError(data.error ?? "Не удалось сохранить аватар.");
        return;
      }
      onApiPersisted?.();
      router.refresh();
    } finally {
      setApiBusy(false);
    }
  }

  async function persistClearApi() {
    setApiError(null);
    setApiBusy(true);
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setApiError(data.error ?? "Не удалось удалить аватар.");
        return;
      }
      onRemoveAvatar();
      onApiPersisted?.();
      router.refresh();
    } finally {
      setApiBusy(false);
    }
  }

  async function persistUploadApi(file: File) {
    setApiError(null);
    setApiBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/profile/avatar/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setApiError(data.error ?? "Не удалось загрузить файл.");
        return;
      }
      onApiPersisted?.();
      router.refresh();
    } finally {
      setApiBusy(false);
    }
  }

  function handlePresetClick(path: string) {
    if (persistMode === "api") {
      void persistPresetApi(path);
    } else {
      onPresetSelect(path);
    }
  }

  function handleRemoveClick() {
    if (persistMode === "api") {
      void persistClearApi();
    } else {
      onRemoveAvatar();
    }
  }

  function handleFileInputChange() {
    const f = fileInputRef.current?.files?.[0];
    onFileChange();
    if (persistMode === "api" && f && f.size > 0) {
      void persistUploadApi(f);
    }
  }

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <div className="flex shrink-0 flex-col items-center gap-3 sm:items-start">
        <div className="relative flex size-36 overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-muted to-muted/50 shadow-inner ring-2 ring-cyan/15">
          {previewDisplay ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob, same-origin API и статика
            <img src={previewDisplay} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="m-auto text-2xl font-semibold text-muted-foreground">{initials}</span>
          )}
        </div>
        <p className="max-w-[12rem] text-center text-xs text-muted-foreground sm:text-left">
          {persistMode === "api"
            ? "Пресет и загрузка сохраняются сразу. Остальные поля — через кнопку внизу формы."
            : "Предпросмотр здесь; сохранение в профиль — кнопкой «Сохранить изменения»."}
        </p>
      </div>

      <div className="min-w-0 flex-1 space-y-6">
        {apiError ? (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {apiError}
          </p>
        ) : null}

        <div>
          <p className="text-sm font-medium text-foreground">Набор CyberEdu</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Милые технологичные аватары в одном стиле (SVG, лёгкие для сети).
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2 sm:max-w-lg">
            {AVATAR_PICKER_ITEMS.map(({ path, label }) => {
              const formActive = !clearAvatar && selectedPreset === path && !filePreview;
              const apiActive = !clearAvatar && profileAvatarUrl === path && !filePreview;
              const showRing = persistMode === "form" ? formActive : apiActive;

              return (
                <button
                  key={path}
                  type="button"
                  disabled={busy}
                  title={label}
                  aria-label={label}
                  aria-pressed={showRing}
                  onClick={() => handlePresetClick(path)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    showRing ? "border-primary ring-2 ring-primary/25" : "border-transparent hover:border-border",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={path} alt="" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Своё изображение</p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG или WebP, до 2 МБ. Загрузка SVG отключена.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              name={persistMode === "form" ? "avatarFile" : "avatarFilePicker"}
              accept="image/png,image/jpeg,image/webp"
              disabled={busy}
              onChange={handleFileInputChange}
              className="block w-full max-w-xs text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          {fileFieldError ? <p className="mt-2 text-sm text-danger">{fileFieldError}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={handleRemoveClick}>
            Удалить аватар
          </Button>
        </div>
      </div>
    </div>
  );
}
