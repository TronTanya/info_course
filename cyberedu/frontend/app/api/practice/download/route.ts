import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDbUserRole } from "@/lib/permissions";
import { findStoredPracticeFile, mimeForPracticeExt } from "@/lib/practice-files";
import { withAuthApiRoute } from "@/lib/security/api-guard";

export const GET = withAuthApiRoute(
  { rateLimit: "practiceDownload" },
  async ({ userId, req }) => {
    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id) {
      return new NextResponse("Доступ запрещён.", { status: 403 });
    }

    const dbRole = await getDbUserRole(userId);
    const isAdmin = dbRole === "ADMIN";

    const sub = await prisma.submission.findFirst({
      where: isAdmin ? { id } : { id, userId },
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
  },
);
