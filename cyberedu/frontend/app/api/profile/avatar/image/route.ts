import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { findUserAvatarFile, mimeForAvatarExt } from "@/lib/avatar-upload";
import { withAuthApiRoute } from "@/lib/security/api-guard";

export const GET = withAuthApiRoute({}, async ({ userId }) => {
  const found = await findUserAvatarFile(userId);
  if (!found) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buf = await readFile(found.fullPath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": mimeForAvatarExt(found.ext),
      "Cache-Control": "private, max-age=300",
    },
  });
});
