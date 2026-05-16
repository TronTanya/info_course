import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { securityAudit } from "@/lib/security/audit";
import { consumeCompositeRateLimit } from "@/lib/security/rate-limit";
import { clientIpFromRequest } from "@/lib/security/request-ip";
import { sessionHasPermission, type Permission } from "@/lib/security/rbac";

export type ApiAuthMode = "required" | "admin" | "optional";

export type ApiGuardContext = {
  req: Request;
  session: Session | null;
  userId: string | null;
  ip: string;
  json?: unknown;
};

export type ApiGuardOptions = {
  auth?: ApiAuthMode;
  permission?: Permission;
  rateLimit?: { name: string; ipMax: number; userMax?: number; windowMs: number };
  bodySchema?: z.ZodType;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/**
 * Централизованная обёртка для Route Handlers: auth, RBAC, rate limit, Zod, audit при отказе.
 */
export function withApiGuard(
  options: ApiGuardOptions,
  handler: (ctx: ApiGuardContext) => Promise<Response>,
): (req: Request, routeCtx?: unknown) => Promise<Response> {
  return async (req: Request) => {
    const ip = clientIpFromRequest(req);
    const path = new URL(req.url).pathname;

    if (options.rateLimit) {
      const rl = options.rateLimit;
      const sessionEarly = options.auth === "optional" ? null : await auth().catch(() => null);
      const uid = sessionEarly?.user?.id;
      const composite = await consumeCompositeRateLimit({
        ipKey: `${rl.name}:ip:${ip}`,
        userKey: uid ? `${rl.name}:user:${uid}` : undefined,
        ipMax: rl.ipMax,
        userMax: rl.userMax,
        windowMs: rl.windowMs,
      });
      if (!composite.allowed) {
        securityAudit({
          event: "api.rate_limited",
          severity: "warn",
          ip,
          path,
          meta: { limit: rl.name },
        });
        return jsonError("Слишком много запросов. Попробуйте позже.", 429);
      }
    }

    let session: Session | null = null;
    const mode = options.auth ?? "required";

    if (mode !== "optional") {
      session = await auth().catch(() => null);
      if (!session?.user?.id) {
        securityAudit({ event: "api.auth_denied", severity: "warn", ip, path });
        return jsonError("Требуется авторизация.", 401);
      }
      if (mode === "admin" && session.user.role !== "ADMIN") {
        securityAudit({
          event: "api.admin_denied",
          severity: "high",
          actorId: session.user.id,
          ip,
          path,
        });
        return jsonError("Доступ только для администратора.", 403);
      }
      if (options.permission && !sessionHasPermission(session, options.permission)) {
        securityAudit({
          event: "api.permission_denied",
          severity: "warn",
          actorId: session.user.id,
          ip,
          path,
          meta: { permission: options.permission },
        });
        return jsonError("Недостаточно прав.", 403);
      }
    } else {
      session = await auth().catch(() => null);
    }

    let json: unknown;
    if (options.bodySchema && req.method !== "GET" && req.method !== "HEAD") {
      json = await parseJsonBody(req);
      const parsed = options.bodySchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Некорректное тело запроса.", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      json = parsed.data;
    }

    return handler({
      req,
      session,
      userId: session?.user?.id ?? null,
      ip,
      json,
    });
  };
}
