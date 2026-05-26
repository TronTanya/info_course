"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { updateUserSettingsAction, type UpdateUserSettingsState } from "@/lib/actions/user-settings";
import { AvatarPicker } from "@/components/profile/avatar-picker";
import { canonicalizeBuiltinPreset, isBuiltinPresetAvatarUrl, isCustomAvatarApiPath } from "@/lib/avatar-presets";
import { INTEREST_TAG_OPTIONS } from "@/lib/profile-interests";
import { Alert } from "@/components/ui/alert";
import { ActionPanel } from "@/components/ui/action-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type UserSettingsDefaults = {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  educationalInstitution: string;
  city: string;
  specialty: string;
  avatarUrl: string | null;
  selectedTags: readonly string[];
  customInterest: string;
};

function firstErrorMessage(state: UpdateUserSettingsState): string | null {
  if (state.message) return state.message;
  if (!state.errors) return null;
  for (const v of Object.values(state.errors)) {
    if (v?.[0]) return v[0];
  }
  return null;
}

function initialsFromName(first: string, last: string): string {
  const a = last.trim()[0] ?? "";
  const b = first.trim()[0] ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}

export function UserSettingsForm({ defaults, email }: { defaults: UserSettingsDefaults; email: string }) {
  const [state, formAction, pending] = useActionState(updateUserSettingsAction, {} as UpdateUserSettingsState);
  const fileRef = useRef<HTMLInputElement>(null);

  const [clearAvatar, setClearAvatar] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(() =>
    canonicalizeBuiltinPreset(defaults.avatarUrl),
  );
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const selectedTags = useMemo(() => new Set(defaults.selectedTags), [defaults.selectedTags]);

  const hiddenAvatarUrl = useMemo(() => {
    if (clearAvatar) return "";
    if (filePreview) return "";
    if (selectedPreset) return selectedPreset;
    if (defaults.avatarUrl && (isCustomAvatarApiPath(defaults.avatarUrl) || /^https?:\/\//i.test(defaults.avatarUrl))) {
      return defaults.avatarUrl;
    }
    return "";
  }, [clearAvatar, filePreview, selectedPreset, defaults.avatarUrl]);

  const previewDisplay = useMemo(() => {
    if (clearAvatar) return null;
    if (filePreview) return filePreview;
    if (selectedPreset) return selectedPreset;
    const u = defaults.avatarUrl;
    if (!u) return null;
    if (isBuiltinPresetAvatarUrl(u) || u.startsWith("http")) return u;
    if (isCustomAvatarApiPath(u)) return u;
    return null;
  }, [clearAvatar, filePreview, selectedPreset, defaults.avatarUrl]);

  useEffect(() => {
    return () => {
      if (filePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  function onPickPreset(path: string) {
    setClearAvatar(false);
    setSelectedPreset(path);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onRemoveAvatar() {
    setClearAvatar(true);
    setSelectedPreset(null);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFileChange() {
    const f = fileRef.current?.files?.[0];
    if (!f) {
      setFilePreview(null);
      return;
    }
    setClearAvatar(false);
    setSelectedPreset(null);
    const url = URL.createObjectURL(f);
    setFilePreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  }

  const initials = initialsFromName(defaults.firstName, defaults.lastName);
  const topError = firstErrorMessage(state);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="clearAvatar" value={clearAvatar ? "1" : "0"} />
      <input type="hidden" name="avatarUrl" value={hiddenAvatarUrl} />

      {topError ? (
        <Alert variant="danger" title="Не удалось сохранить">
          {topError}
        </Alert>
      ) : null}

      <section className="ce-polish-panel">
        <div className="ce-settings-panel-header">
          <h2 className="ds-typo-h3 text-lg">Личные данные</h2>
          <p className="mt-1 text-sm text-muted-foreground">Используются в сертификате и в интерфейсе курса.</p>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:gap-6 sm:p-8">
          <Input
            label="Фамилия *"
            name="lastName"
            defaultValue={defaults.lastName}
            autoComplete="family-name"
            required
            disabled={pending}
            error={state.errors?.lastName?.[0]}
          />
          <Input
            label="Имя *"
            name="firstName"
            defaultValue={defaults.firstName}
            autoComplete="given-name"
            required
            disabled={pending}
            error={state.errors?.firstName?.[0]}
          />
          <Input
            label="Отчество"
            name="middleName"
            defaultValue={defaults.middleName}
            autoComplete="additional-name"
            disabled={pending}
            error={state.errors?.middleName?.[0]}
          />
          <Input
            label="Дата рождения *"
            name="birthDate"
            type="date"
            defaultValue={defaults.birthDate}
            required
            disabled={pending}
            error={state.errors?.birthDate?.[0]}
          />
          <Input
            label="Город *"
            name="city"
            defaultValue={defaults.city}
            autoComplete="address-level2"
            required
            disabled={pending}
            error={state.errors?.city?.[0]}
          />
          <div className="sm:col-span-2">
            <Input
              label="Учебное заведение *"
              name="educationalInstitution"
              defaultValue={defaults.educationalInstitution}
              placeholder="Вуз, колледж, школа…"
              required
              disabled={pending}
              error={state.errors?.educationalInstitution?.[0]}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Специальность *"
              name="specialty"
              defaultValue={defaults.specialty}
              required
              disabled={pending}
              error={state.errors?.specialty?.[0]}
            />
          </div>
        </div>
      </section>

      <section className="ce-polish-panel">
        <div className="ce-settings-panel-header">
          <h2 className="ds-typo-h3 text-lg">Аватар</h2>
          <p className="mt-1 text-sm text-muted-foreground">Выберите пресет, загрузите своё фото или сбросьте к инициалам.</p>
        </div>
        <div className="p-6 sm:p-8">
          <AvatarPicker
            disabled={pending}
            initials={initials}
            profileAvatarUrl={defaults.avatarUrl}
            selectedPreset={selectedPreset}
            clearAvatar={clearAvatar}
            filePreview={filePreview}
            previewDisplay={previewDisplay}
            onPresetSelect={onPickPreset}
            onRemoveAvatar={onRemoveAvatar}
            onFileChange={onFileChange}
            fileInputRef={fileRef}
            fileFieldError={state.errors?.avatarFile?.[0]}
            persistMode="form"
          />
        </div>
      </section>

      <section className="ce-polish-panel">
        <div className="ce-settings-panel-header">
          <h2 className="ds-typo-h3 text-lg">Интересы для AI</h2>
          <p className="mt-1 text-sm text-muted-foreground">По ним подстраиваются примеры и объяснения в лекциях.</p>
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          {state.errors?.interests?.[0] ? (
            <p className="text-sm text-danger" role="alert">
              {state.errors.interests[0]}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAG_OPTIONS.map((tag) => (
              <label
                key={tag}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:border-primary/40 has-checked:border-primary/50 has-checked:bg-primary/10"
              >
                <input
                  type="checkbox"
                  name="tag"
                  value={tag}
                  defaultChecked={selectedTags.has(tag)}
                  disabled={pending}
                  className="size-4 rounded border-border text-primary focus:ring-ring"
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
          <Textarea
            label="Свой интерес"
            name="customInterest"
            placeholder="Например: CTF, OSINT, 3D-печать…"
            defaultValue={defaults.customInterest}
            disabled={pending}
            rows={3}
          />
        </div>
      </section>

      <section className="ce-polish-panel">
        <div className="ce-settings-panel-header">
          <h2 className="ds-typo-h3 text-lg">Безопасность аккаунта</h2>
          <p className="mt-1 text-sm text-muted-foreground">Вход и контактный email.</p>
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <div className="ce-polish-inset px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
            <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
          </div>
          <div className="space-y-2">
            <Button type="button" variant="outline" disabled aria-describedby="pwd-hint">
              Сменить пароль
            </Button>
            <p id="pwd-hint" className="text-xs leading-relaxed text-muted-foreground">
              Функция в разработке (скоро): смена пароля и подтверждение по email из этого раздела.
            </p>
          </div>
        </div>
      </section>

      <ActionPanel sticky className="mt-8">
        <p className="typo-body-muted">Изменения применяются после сохранения.</p>
        <Button type="submit" variant="primary" size="lg" loading={pending} className="w-full min-w-0 sm:w-auto sm:min-w-50">
          Сохранить изменения
        </Button>
      </ActionPanel>
    </form>
  );
}
