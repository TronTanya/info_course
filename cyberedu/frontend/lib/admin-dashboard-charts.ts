import { assertAdminDataAccess } from "@/lib/admin-access";
import { prisma } from "@/lib/db";

export type AdminChartSlice = {
  key: string;
  label: string;
  count: number;
  fill: string;
};

export type AdminDashboardChartsData = {
  submissions: AdminChartSlice[];
  progressBuckets: AdminChartSlice[];
};

const SUBMISSION_META: Record<string, { label: string; fill: string }> = {
  SUBMITTED: { label: "Отправлено", fill: "var(--cyan)" },
  CHECKING: { label: "На проверке", fill: "var(--primary)" },
  NEEDS_REVISION: { label: "На доработке", fill: "var(--warning)" },
  ACCEPTED: { label: "Принято", fill: "var(--success)" },
  REJECTED: { label: "Отклонено", fill: "var(--danger)" },
};

const BUCKET_DEFS: { key: string; label: string; fill: string; min: number; max: number }[] = [
  { key: "0", label: "0%", fill: "color-mix(in oklab, var(--muted-foreground) 70%, transparent)", min: 0, max: 0 },
  { key: "1-25", label: "1–25%", fill: "var(--secondary)", min: 1, max: 25 },
  { key: "26-50", label: "26–50%", fill: "var(--primary)", min: 26, max: 50 },
  { key: "51-75", label: "51–75%", fill: "var(--cyan)", min: 51, max: 75 },
  { key: "76-99", label: "76–99%", fill: "color-mix(in oklab, var(--warning) 85%, var(--primary))", min: 76, max: 99 },
  { key: "100", label: "100%", fill: "var(--success)", min: 100, max: 100 },
];

function bucketPercent(pct: number): string {
  for (const b of BUCKET_DEFS) {
    if (pct >= b.min && pct <= b.max) return b.key;
  }
  return "0";
}

export async function getAdminDashboardChartsData(): Promise<AdminDashboardChartsData> {
  await assertAdminDataAccess();
  const [submissionGroups, activeModuleCount, students, completedByUser] = await Promise.all([
    prisma.submission.groupBy({
      by: ["status"],
      where: { status: { not: "DRAFT" } },
      _count: { _all: true },
    }),
    prisma.module.count({ where: { isActive: true } }),
    prisma.user.findMany({ where: { role: "USER" }, select: { id: true } }),
    prisma.progress.groupBy({
      by: ["userId"],
      where: { moduleCompleted: true, module: { isActive: true } },
      _count: { _all: true },
    }),
  ]);

  const completedMap = new Map(completedByUser.map((r) => [r.userId, r._count._all]));

  const bucketCounts = new Map(BUCKET_DEFS.map((b) => [b.key, 0]));
  for (const s of students) {
    const done = completedMap.get(s.id) ?? 0;
    const pct = activeModuleCount > 0 ? Math.round((done / activeModuleCount) * 100) : 0;
    const key = bucketPercent(pct);
    bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
  }

  const submissions: AdminChartSlice[] = submissionGroups
    .flatMap((g) => {
      const meta = SUBMISSION_META[g.status];
      if (!meta) return [];
      return [{ key: g.status, label: meta.label, count: g._count._all, fill: meta.fill }];
    })
    .sort((a, b) => b.count - a.count);

  const progressBuckets: AdminChartSlice[] = BUCKET_DEFS.map((b) => ({
    key: b.key,
    label: b.label,
    count: bucketCounts.get(b.key) ?? 0,
    fill: b.fill,
  }));

  return { submissions, progressBuckets };
}
