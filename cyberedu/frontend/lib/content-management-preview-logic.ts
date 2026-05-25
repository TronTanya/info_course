import type { AdminContentOverview } from "@/lib/admin-dashboard";

/** Реальные маршруты редактора контента в `app/admin/(protected)/`. */
export const ADMIN_CONTENT_EDITOR_ROUTES = {
  modules: "/admin/modules",
  lessons: "/admin/lessons",
  tests: "/admin/tests",
  practices: "/admin/practical-tasks",
} as const;

export type ContentEditorRouteKey = keyof typeof ADMIN_CONTENT_EDITOR_ROUTES;

export type ContentManagementDrafts = {
  /** Модули с `isActive = false` (не видны студентам). */
  inactiveModules: number;
  /** Тесты без вопросов — не готовы к прохождению. */
  testsWithoutQuestions: number;
};

export type ContentManagementPreviewData = {
  courseTitle: string | null;
  counts: {
    modules: number;
    lessons: number;
    tests: number;
    practices: number;
  };
  drafts: ContentManagementDrafts | null;
  routesConfigured: boolean;
  actions: Array<{
    key: ContentEditorRouteKey;
    label: string;
    href: string | null;
    count: number;
  }>;
};

export const CONTENT_MANAGEMENT_UNCONFIGURED_MESSAGE =
  "Раздел управления контентом не настроен.";

const ACTION_LABELS: Record<ContentEditorRouteKey, string> = {
  modules: "Управлять модулями",
  lessons: "Управлять уроками",
  tests: "Управлять тестами",
  practices: "Управлять практиками",
};

export function areContentEditorRoutesConfigured(
  routes: Partial<Record<ContentEditorRouteKey, string | null | undefined>> = ADMIN_CONTENT_EDITOR_ROUTES,
): boolean {
  const keys: ContentEditorRouteKey[] = ["modules", "lessons", "tests", "practices"];
  return keys.every((key) => {
    const href = routes[key];
    return typeof href === "string" && href.trim().length > 0 && href.startsWith("/admin/");
  });
}

export function contentManagementDraftsTotal(drafts: ContentManagementDrafts): number {
  return drafts.inactiveModules + drafts.testsWithoutQuestions;
}

export function buildContentManagementPreviewData(input: {
  content: AdminContentOverview;
  drafts?: ContentManagementDrafts | null;
  routes?: Partial<Record<ContentEditorRouteKey, string | null | undefined>>;
}): ContentManagementPreviewData {
  const routes = { ...ADMIN_CONTENT_EDITOR_ROUTES, ...input.routes };
  const routesConfigured = areContentEditorRoutesConfigured(routes);

  const drafts =
    input.drafts && contentManagementDraftsTotal(input.drafts) > 0 ? input.drafts : null;

  const countByKey: Record<ContentEditorRouteKey, number> = {
    modules: input.content.modulesTotal,
    lessons: input.content.lessonsTotal,
    tests: input.content.testsTotal,
    practices: input.content.practicalTasksTotal,
  };

  const actions = (Object.keys(ACTION_LABELS) as ContentEditorRouteKey[]).map((key) => ({
    key,
    label: ACTION_LABELS[key],
    href: routesConfigured ? (routes[key] ?? null) : null,
    count: countByKey[key],
  }));

  return {
    courseTitle: input.content.courseTitle,
    counts: {
      modules: input.content.modulesTotal,
      lessons: input.content.lessonsTotal,
      tests: input.content.testsTotal,
      practices: input.content.practicalTasksTotal,
    },
    drafts,
    routesConfigured,
    actions,
  };
}
