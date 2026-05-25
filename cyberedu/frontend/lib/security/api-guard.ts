import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { securityAudit } from "@/lib/security/audit";
import { enforceAiMentorApiRateLimit } from "@/lib/security/ai-rate-limit";
import { resolveApiRateLimitMessage, isAiRateLimitPolicyKey } from "@/lib/security/rate-limit-messages";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromRequest } from "@/lib/security/request-ip";
import { logError } from "@/lib/log/structured";
import { sessionHasPermission, type Permission } from "@/lib/security/rbac";

/** Явная метка публичного маршрута (без auth). */
export const API_ROUTE_PUBLIC = { public: true as const } satisfies ApiGuardOptions;

export type ApiAuthMode = "required" | "admin" | "optional";

export type ApiGuardContext<TBody = unknown> = {
  req: Request;
  session: Session;
  userId: string;
  ip: string;
  body: TBody;
};

export type ApiGuardPublicContext = {
  req: Request;
  session: Session | null;
  userId: string | null;
  ip: string;
  body: unknown;
};

export type ApiGuardOptions = {
  /** Публичный endpoint: без requireAuth / requireAdmin. */
  public?: boolean;
  /** Требовать сессию (по умолчанию true, кроме public). */
  requireAuth?: boolean;
  /** Только ADMIN (+ optional permission). */
  requireAdmin?: boolean;
  /** @deprecated Используйте requireAdmin / public. */
  auth?: ApiAuthMode;
  permission?: Permission;
  rateLimit?: keyof typeof RATE_LIMIT_POLICIES | { scope: string; max: number; windowMs: number };
  bodySchema?: z.ZodType;
  /** multipart / raw stream — не парсить JSON. */
  skipBodyParse?: boolean;
};

export type ApiGuardHandler<TRouteCtx = unknown, TBody = unknown> = (
  ctx: ApiGuardContext<TBody>,
  routeCtx: TRouteCtx,
) => Promise<Response>;

export type ApiGuardPublicHandler<TRouteCtx = unknown> = (
  ctx: ApiGuardPublicContext,
  routeCtx: TRouteCtx,
) => Promise<Response>;

function jsonError(message: string, status: number, details?: unknown) {
  if (details !== undefined) {
    return NextResponse.json({ error: message, details }, { status });
  }
  return NextResponse.json({ error: message }, { status });
}

function resolveRateLimitPolicy(
  rl: NonNullable<ApiGuardOptions["rateLimit"]>,
): { scope: string; max: number; windowMs: number } {
  if (typeof rl === "string") {
    const p = RATE_LIMIT_POLICIES[rl];
    return { scope: p.scope, max: p.max, windowMs: p.windowMs };
  }
  return rl;
}

function resolveAuthFlags(options: ApiGuardOptions): {
  isPublic: boolean;
  requireAuth: boolean;
  requireAdmin: boolean;
} {
  if (options.public) {
    return { isPublic: true, requireAuth: false, requireAdmin: false };
  }
  const requireAdmin = options.requireAdmin === true || options.auth === "admin";
  const requireAuth = options.requireAuth !== false && options.auth !== "optional";
  return { isPublic: false, requireAuth, requireAdmin };
}

export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

function safeHandlerError(path: string, ip: string, actorId: string | null, err: unknown): Response {
  logError("api_guard_unhandled", {
    path,
    actorId: actorId ?? undefined,
    errorType: err instanceof Error ? err.name : "unknown",
    errorMessage: err instanceof Error ? err.message.slice(0, 200) : undefined,
  });
  securityAudit({
    event: "api.unhandled_error",
    severity: "high",
    actorId,
    ip,
    path,
    meta: { errorType: err instanceof Error ? err.name : "unknown" },
  });
  return jsonError("Внутренняя ошибка сервера. Попробуйте позже.", 500);
}

/**
 * Централизованная обёртка Route Handlers: auth, RBAC, rate limit, Zod, audit, safe errors.
 */
type InferGuardBody<TSchema extends z.ZodTypeAny | undefined> = TSchema extends z.ZodTypeAny
  ? z.infer<TSchema>
  : unknown;

export function withApiGuard<
  TRouteCtx = unknown,
  TBodySchema extends z.ZodTypeAny | undefined = undefined,
>(
  options: ApiGuardOptions & { bodySchema?: TBodySchema },
  handler: ApiGuardHandler<TRouteCtx, InferGuardBody<TBodySchema>>,
): (req: Request, routeCtx?: TRouteCtx) => Promise<Response> {
  return async (req: Request, routeCtx?: TRouteCtx) => {
    const ip = clientIpFromRequest(req);
    const path = new URL(req.url).pathname;
    const { isPublic, requireAuth, requireAdmin } = resolveAuthFlags(options);

    let session: Session | null = null;
    if (!isPublic || options.rateLimit) {
      session = await auth().catch(() => null);
    }

    const userId = session?.user?.id ?? null;

    if (options.rateLimit) {
      const policy = resolveRateLimitPolicy(options.rateLimit);
      const rateLimitKey =
        typeof options.rateLimit === "string" ? options.rateLimit : policy.scope;

      const rl =
        typeof options.rateLimit === "string" &&
        isAiRateLimitPolicyKey(options.rateLimit) &&
        userId
          ? await enforceAiMentorApiRateLimit({ userId, clientIp: ip })
          : await enforceRateLimit({
              scope: policy.scope,
              userId,
              clientIp: ip,
              max: policy.max,
              windowMs: policy.windowMs,
            });

      if (!rl.allowed) {
        securityAudit({
          event: "api.rate_limited",
          severity: "warn",
          actorId: userId ?? undefined,
          ip,
          path,
          meta: { limit: policy.scope, reason: rl.reason },
        });
        return NextResponse.json(
          {
            error: resolveApiRateLimitMessage(rateLimitKey, rl.reason),
            code: "RATE_LIMITED",
          },
          { status: 429 },
        );
      }
    }

    if (requireAuth && !session?.user?.id) {
      securityAudit({ event: "api.auth_denied", severity: "warn", ip, path });
      return jsonError("Требуется авторизация.", 401);
    }

    if (requireAdmin) {
      if (!session?.user?.id) {
        securityAudit({ event: "api.auth_denied", severity: "warn", ip, path });
        return jsonError("Требуется авторизация.", 401);
      }
      if (session.user.role !== "ADMIN") {
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
    } else if (requireAuth && options.permission && session && !sessionHasPermission(session, options.permission)) {
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

    let body: unknown;
    if (options.bodySchema && !options.skipBodyParse && req.method !== "GET" && req.method !== "HEAD") {
      const raw = await parseJsonBody(req);
      const parsed = options.bodySchema.safeParse(raw);
      if (!parsed.success) {
        securityAudit({
          event: "api.validation_failed",
          severity: "info",
          actorId: userId ?? undefined,
          ip,
          path,
        });
        return jsonError("Некорректное тело запроса.", 400, parsed.error.flatten());
      }
      body = parsed.data;
    }

    if (isPublic) {
      const publicCtx: ApiGuardPublicContext = {
        req,
        session,
        userId,
        ip,
        body,
      };
      try {
        return await (handler as unknown as ApiGuardPublicHandler<TRouteCtx>)(publicCtx, routeCtx as TRouteCtx);
      } catch (err) {
        return safeHandlerError(path, ip, userId, err);
      }
    }

    const authedSession = session as Session;
    const authedUserId = authedSession.user!.id;
    const ctx: ApiGuardContext<InferGuardBody<TBodySchema>> = {
      req,
      session: authedSession,
      userId: authedUserId,
      ip,
      body: body as InferGuardBody<TBodySchema>,
    };

    try {
      return await handler(ctx, routeCtx as TRouteCtx);
    } catch (err) {
      return safeHandlerError(path, ip, authedUserId, err);
    }
  };
}

/** Публичный маршрут (health, и т.п.) — явная метка в коде. */
export function withPublicApiRoute<TRouteCtx = unknown>(
  options: Omit<ApiGuardOptions, "public" | "requireAuth" | "requireAdmin">,
  handler: ApiGuardPublicHandler<TRouteCtx>,
): (req: Request, routeCtx?: TRouteCtx) => Promise<Response> {
  return withApiGuard({ ...options, public: true }, handler as ApiGuardHandler<TRouteCtx>);
}

/** Аутентифицированный маршрут (по умолчанию). */
export function withAuthApiRoute<
  TRouteCtx = unknown,
  TBodySchema extends z.ZodTypeAny | undefined = undefined,
>(
  options: Omit<ApiGuardOptions, "public"> & { bodySchema?: TBodySchema },
  handler: ApiGuardHandler<TRouteCtx, InferGuardBody<TBodySchema>>,
): (req: Request, routeCtx?: TRouteCtx) => Promise<Response> {
  return withApiGuard<TRouteCtx, TBodySchema>({ requireAuth: true, ...options }, handler);
}
