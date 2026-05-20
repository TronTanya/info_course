import type { Role } from "@prisma/client";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

export type ProfileSkillAreaId =
  | "phishing"
  | "passwords"
  | "web_security"
  | "logs"
  | "incident_response"
  | "security_basics";

export type ProfileSkillArea = {
  id: ProfileSkillAreaId;
  label: string;
  percent: number;
  status: "not_started" | "in_progress" | "strong";
  matchedModules: number;
  completedModules: number;
};

const SKILL_DEFINITIONS: {
  id: ProfileSkillAreaId;
  label: string;
  keywords: string[];
}[] = [
  { id: "security_basics", label: "Основы ИБ", keywords: ["основы информационной", "безопасность устройств", "устройств"] },
  { id: "passwords", label: "Пароли", keywords: ["парол", "двухфактор", "аутентиф"] },
  { id: "phishing", label: "Фишинг", keywords: ["фишинг", "социальн"] },
  { id: "web_security", label: "Web security", keywords: ["интернет", "web", "сайт"] },
  { id: "logs", label: "Логи", keywords: ["linux", "сет", "лог"] },
  { id: "incident_response", label: "Incident response", keywords: ["расследован", "soc", "инцидент", "итогов"] },
];

function moduleMatchesSkill(title: string, keywords: string[]): boolean {
  const t = title.toLowerCase();
  return keywords.some((k) => t.includes(k));
}

export function buildProfileSkillsMap(modules: CourseProgressModuleRow[]): ProfileSkillArea[] {
  return SKILL_DEFINITIONS.map((skill) => {
    const matched = modules.filter((row) => moduleMatchesSkill(row.module.title, skill.keywords));
    if (matched.length === 0) {
      return {
        id: skill.id,
        label: skill.label,
        percent: 0,
        status: "not_started" as const,
        matchedModules: 0,
        completedModules: 0,
      };
    }

    const unlocked = matched.filter((row) => row.unlocked);
    const pool = unlocked.length > 0 ? unlocked : matched;
    const percent = Math.round(pool.reduce((sum, row) => sum + row.progressPercent, 0) / pool.length);
    const completedModules = matched.filter((row) => row.moduleCompleted).length;

    let status: ProfileSkillArea["status"] = "not_started";
    if (percent >= 85 || completedModules === matched.length) status = "strong";
    else if (percent > 0) status = "in_progress";

    return {
      id: skill.id,
      label: skill.label,
      percent,
      status,
      matchedModules: matched.length,
      completedModules,
    };
  });
}

export function profileRoleLabel(role: Role): string {
  if (role === "ADMIN") return "Администратор";
  return "Студент";
}

export function buildProfileLearningStatus(stats: ProfileCourseStats): string {
  if (stats.certificateIssued) return "Выпускник программы · сертификат получен";
  if (stats.allModulesComplete) return "Курс завершён · можно оформить сертификат";
  if (stats.currentModuleTitle && stats.currentModuleTitle !== "Все модули завершены") {
    return `В процессе · ${stats.currentModuleTitle}`;
  }
  if (stats.progressPercent > 0) return `Прогресс ${stats.progressPercent}% по программе`;
  return "Старт программы · откройте первый модуль";
}
