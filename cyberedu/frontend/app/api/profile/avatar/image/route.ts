import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findUserAvatarFile, mimeForAvatarExt } from "@/lib/avatar-upload";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const found = await findUserAvatarFile(session.user.id);
  if (!found) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buf = await readFile(found.fullPath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": mimeForAvatarExt(found.ext),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
