import { prisma } from "@/lib/db";

export type LandingModulePreview = {
  orderNumber: number;
  title: string;
  lessonCount: number;
  testCount: number;
  practiceCount: number;
};

export type LandingCoursePreview = {
  title: string;
  description: string | null;
  modules: LandingModulePreview[];
};

/** Публичный срез программы для лендинга (без авторизации). */
export async function getLandingCoursePreview(): Promise<LandingCoursePreview | null> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      title: true,
      description: true,
      modules: {
        where: { isActive: true },
        orderBy: { orderNumber: "asc" },
        select: {
          title: true,
          orderNumber: true,
          _count: { select: { lessons: true, tests: true, practicalTasks: true } },
        },
      },
    },
  });

  if (!course) return null;

  return {
    title: course.title,
    description: course.description,
    modules: course.modules.map((m) => ({
      orderNumber: m.orderNumber,
      title: m.title,
      lessonCount: m._count.lessons,
      testCount: m._count.tests,
      practiceCount: m._count.practicalTasks,
    })),
  };
}
