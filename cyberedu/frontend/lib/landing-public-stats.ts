import { prisma } from "@/lib/db";

export type LandingPublicStats = {
  totalUsers: number;
  activeModules: number;
  practiceTasks: number;
  certificatesIssued: number;
};

/** Значения по умолчанию, если БД недоступна (локальная разработка без Postgres). */
const EMPTY_STATS: LandingPublicStats = {
  totalUsers: 0,
  activeModules: 0,
  practiceTasks: 0,
  certificatesIssued: 0,
};

/** Публичные агрегаты для главной (без персональных данных). */
export async function getLandingPublicStats(): Promise<LandingPublicStats> {
  try {
    const [totalUsers, activeModules, practiceTasks, certificatesIssued] = await Promise.all([
      prisma.user.count(),
      prisma.module.count({ where: { isActive: true } }),
      prisma.practicalTask.count(),
      prisma.certificate.count(),
    ]);
    return { totalUsers, activeModules, practiceTasks, certificatesIssued };
  } catch {
    return EMPTY_STATS;
  }
}
