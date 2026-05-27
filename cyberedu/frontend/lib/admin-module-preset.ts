/** Проверяет moduleId из query и возвращает его, если модуль есть в списке. */
export function resolveAdminModulePreset(
  modules: { id: string }[],
  queryModuleId: string | undefined,
): string {
  const id = queryModuleId?.trim();
  if (!id) return "";
  return modules.some((m) => m.id === id) ? id : "";
}

export function adminModuleEditHref(moduleId: string): string {
  return `/admin/modules/${moduleId}/edit`;
}
