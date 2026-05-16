"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { securityLog } from "@/lib/security-log";
import { serializeProfileInterests } from "@/lib/profile-interests";
import { registerSchema } from "@/lib/validation";

const BCRYPT_COST = 12;

export type RegisterActionState = {
  ok?: boolean;
  /** Email для автоматического входа после регистрации (пароль не возвращается). */
  email?: string;
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    consent?: string[];
    _form?: string[];
  };
};

function formDataToInput(fd: FormData) {
  return {
    email: fd.get("email"),
    password: fd.get("password"),
    confirmPassword: fd.get("confirmPassword"),
    consent: fd.get("consent") === "on",
  };
}

/**
 * Регистрация: пароль только хешируется и сохраняется; открытый текст в ответ не передаётся.
 */
export async function registerAction(_prev: RegisterActionState, formData: FormData): Promise<RegisterActionState> {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  if (!consumeRateLimit(`register:ip:${ip}`, 8, 60 * 60 * 1000)) {
    return { errors: { _form: ["Слишком много попыток регистрации с этого адреса. Попробуйте позже."] } };
  }

  const parsed = registerSchema.safeParse(formDataToInput(formData));
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      errors: {
        email: flat.fieldErrors.email,
        password: flat.fieldErrors.password,
        confirmPassword: flat.fieldErrors.confirmPassword,
        consent: flat.fieldErrors.consent,
      },
    };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  if (!consumeRateLimit(`register:email:${normalizedEmail}`, 5, 24 * 60 * 60 * 1000)) {
    return { errors: { _form: ["Слишком много попыток для этого адреса. Попробуйте позже."] } };
  }

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    let newUserId = "";
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
        },
      });
      newUserId = user.id;

      await tx.profile.create({
        data: {
          userId: user.id,
          lastName: "—",
          firstName: "—",
          middleName: null,
          birthDate: new Date("2000-01-01"),
          educationalInstitution: "—",
          city: "—",
          specialty: "—",
          interests: serializeProfileInterests({ version: 1, tags: ["программирование"], custom: "" }),
        },
      });
    });

    securityLog("auth.register", { userId: newUserId });
    return { ok: true, email: normalizedEmail };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { errors: { email: ["Пользователь с таким email уже зарегистрирован"] } };
    }
    console.error(e);
    return { errors: { _form: ["Не удалось создать учётную запись. Попробуйте позже."] } };
  }
}
