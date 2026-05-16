import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminUsersToCsv } from "@/lib/admin-users-csv";
import { getAdminUserListRows } from "@/lib/admin-users-list";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ только для администратора" }, { status: 403 });
  }

  const rows = await getAdminUserListRows();
  const csv = adminUsersToCsv(rows);
  const day = new Date().toISOString().slice(0, 10);
  const filename = `cyberedu-users-${day}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
