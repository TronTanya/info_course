"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateProfileAction, type UpdateProfileState } from "@/lib/actions/profile";
import { INTEREST_TAG_OPTIONS } from "@/lib/profile-interests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ProfileEditFormDefaults = {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  educationalInstitution: string;
  city: string;
  specialty: string;
  avatarUrl: string;
  selectedTags: readonly string[];
  customInterest: string;
};

export function ProfileEditForm({ defaultValues }: { defaultValues: ProfileEditFormDefaults }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {} as UpdateProfileState);
  const selected = new Set(defaultValues.selectedTags);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование профиля</CardTitle>
        <CardDescription>
          Данные используются для сертификата и для AI-адаптации лекций под ваши интересы.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Фамилия *"
              name="lastName"
              defaultValue={defaultValues.lastName}
              autoComplete="family-name"
              required
              disabled={pending}
              error={state.errors?.lastName?.[0]}
            />
            <Input
              label="Имя *"
              name="firstName"
              defaultValue={defaultValues.firstName}
              autoComplete="given-name"
              required
              disabled={pending}
              error={state.errors?.firstName?.[0]}
            />
            <Input
              label="Отчество"
              name="middleName"
              defaultValue={defaultValues.middleName}
              autoComplete="additional-name"
              disabled={pending}
              error={state.errors?.middleName?.[0]}
            />
            <Input
              label="Дата рождения *"
              name="birthDate"
              type="date"
              defaultValue={defaultValues.birthDate}
              required
              disabled={pending}
              error={state.errors?.birthDate?.[0]}
            />
            <div className="md:col-span-2">
              <Input
                label="Учебное заведение *"
                name="educationalInstitution"
                defaultValue={defaultValues.educationalInstitution}
                placeholder="Вуз, колледж, школа…"
                required
                disabled={pending}
                error={state.errors?.educationalInstitution?.[0]}
              />
              <p className="mt-1 text-xs text-muted-foreground">Укажите для документов и сертификата.</p>
            </div>
            <Input label="Город *" name="city" defaultValue={defaultValues.city} required disabled={pending} error={state.errors?.city?.[0]} />
            <Input
              label="Специальность *"
              name="specialty"
              defaultValue={defaultValues.specialty}
              required
              disabled={pending}
              error={state.errors?.specialty?.[0]}
            />
            <div className="md:col-span-2">
              <Input
                label="Ссылка на аватар"
                name="avatarUrl"
                type="url"
                inputMode="url"
                placeholder="https://…"
                defaultValue={defaultValues.avatarUrl}
                disabled={pending}
                error={state.errors?.avatarUrl?.[0]}
              />
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Интересы *</legend>
            <p className="text-xs text-muted-foreground">
              Выберите теги и/или допишите свой вариант — по ним AI подстраивает примеры в лекциях.
            </p>
            {state.errors?.interests?.[0] ? <p className="text-xs text-danger">{state.errors.interests[0]}</p> : null}
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAG_OPTIONS.map((tag) => (
                <label
                  key={tag}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:border-primary/40 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/10"
                >
                  <input
                    type="checkbox"
                    name="tag"
                    value={tag}
                    defaultChecked={selected.has(tag)}
                    disabled={pending}
                    className="size-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
            <Input
              label="Свой интерес"
              name="customInterest"
              placeholder="Например: CTF, OSINT, 3D-печать…"
              defaultValue={defaultValues.customInterest}
              disabled={pending}
            />
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={pending}>
              Сохранить
            </Button>
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/profile">Отмена</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
