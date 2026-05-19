import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Укажите email").email("Некорректный email");

/** Минимум 8 символов, буквы (латиница или кириллица) и хотя бы одна цифра. */
export const passwordSchema = z
  .string()
  .min(8, "Минимум 8 символов")
  .max(128, "Максимум 128 символов")
  .regex(/[A-Za-zА-Яа-яЁё]/, "Пароль должен содержать буквы")
  .regex(/\d/, "Пароль должен содержать цифры");

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Укажите имя (минимум 2 символа)")
      .max(120, "Слишком длинное имя"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
    consent: z.boolean(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли должны совпадать",
  })
  .refine((d) => d.consent === true, {
    path: ["consent"],
    message: "Необходимо согласие на обработку персональных данных",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введите пароль"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Недействительная ссылка"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли должны совпадать",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const optionalLooseString = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s === "" ? undefined : s));

import { isAllowedStoredAvatarUrl } from "@/lib/avatar-presets";
import { isSafeExternalHttpsUrl } from "@/lib/security/sanitize";

/** Данные формы редактирования профиля (после разбора FormData). */
export const profileEditInputSchema = z
  .object({
    lastName: z.string().trim().min(1, "Укажите фамилию"),
    firstName: z.string().trim().min(1, "Укажите имя"),
    middleName: optionalLooseString,
    birthDate: z
      .string()
      .min(1, "Укажите дату рождения")
      .refine((s) => !Number.isNaN(Date.parse(s)), "Некорректная дата"),
    educationalInstitution: z.string().trim().min(1, "Укажите учебное заведение"),
    city: z.string().trim().min(1, "Укажите город"),
    specialty: z.string().trim().min(1, "Укажите специальность"),
    avatarUrl: z
      .string()
      .trim()
      .optional()
      .transform((s) => s ?? "")
      .refine(
        (s) =>
          s.length === 0 ||
          isAllowedStoredAvatarUrl(s) ||
          (s.startsWith("https://") && isSafeExternalHttpsUrl(s)),
        "Некорректная ссылка на аватар",
      ),
    tags: z.array(z.string()),
    customInterest: z.string().trim().default(""),
  })
  .refine((d) => d.tags.length > 0 || d.customInterest.length > 0, {
    path: ["interests"],
    message: "Выберите минимум один интерес или укажите свой вручную",
  });

export type ProfileEditInput = z.infer<typeof profileEditInputSchema>;

export const userReviewSubmitSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  text: z
    .string()
    .trim()
    .min(10, "Минимум 10 символов")
    .max(4000, "Максимум 4000 символов"),
});

export type UserReviewSubmitInput = z.infer<typeof userReviewSubmitSchema>;

