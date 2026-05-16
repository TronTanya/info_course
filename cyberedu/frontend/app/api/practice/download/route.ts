import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findStoredPracticeFile, mimeForPracticeExt } from "@/lib/practice-files";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";

export async function GET(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id || !session?.user?.id) {
    return new NextResponse("Доступ запрещён.", { status: 403 });
  }

  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`practice:download:ip:${ip}`, 120, 60 * 60 * 1000) ||
    !consumeRateLimit(`practice:download:user:${session.user.id}`, 80, 60 * 60 * 1000)
  ) {
    return new NextResponse("Слишком много запросов.", { status: 429 });
  }

  const isAdmin = session.user.role === "ADMIN";

  const sub = await prisma.submission.findFirst({
    where: isAdmin ? { id } : { id, userId: session.user.id },
    select: { id: true },
  });
  if (!sub) {
    return new NextResponse("Не найдено.", { status: 404 });
  }

  const hit = await findStoredPracticeFile(id);
  if (!hit) {
    return new NextResponse("Файл не найден.", { status: 404 });
  }

  const buf = await readFile(hit.fullPath);

  return new NextResponse(buf, {
    headers: {
      "Content-Type": mimeForPracticeExt(hit.ext),
      "Content-Disposition": `attachment; filename="practice-${id}.${hit.ext}"`,
    },
  });
}
