import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  BookText,
  Bot,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import type { StudentQuickNavKey } from "@/lib/nav-resolve";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export type QuickNavItem = {
  key: StudentQuickNavKey;
  label: string;
  icon: LucideIcon;
  description?: string;
};

/** Публичный маркетинговый сайт (лендинг, шапка гостя). */
export const publicNavLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "/", label: "Главная" },
  { href: "/#what-you-learn", label: "Программа" },
  { href: "/#practice-lab", label: "Практики" },
  { href: "/#certificates", label: "Сертификат" },
];

export const guestAuthLinks = {
  login: "/auth/login",
  register: "/auth/register",
  loginLabel: "Войти",
  registerLabel: "Начать обучение",
} as const;

/** @deprecated Используйте publicNavLinks — сохранено для обратной совместимости. */
export const guestNavLinks: { href: string; label: string }[] = [
  ...publicNavLinks,
  { href: "/reviews", label: "Отзывы" },
  { href: "/about", label: "О проекте" },
];

export const landingFooterNavLinks: { href: string; label: string }[] = [
  ...publicNavLinks,
  { href: "/#how-it-works", label: "Обучение" },
  { href: "/#ai-mentor", label: "AI-наставник" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/about", label: "О проекте" },
  { href: guestAuthLinks.login, label: guestAuthLinks.loginLabel },
];

/** Основная навигация студента (sidebar, drawer, command palette). */
export const studentQuickNav: QuickNavItem[] = [
  { key: "dashboard", label: "Кабинет", icon: LayoutDashboard, description: "Обзор и прогресс" },
  { key: "course", label: "Курс", icon: BookOpen, description: "Модули программы" },
  { key: "lessons", label: "Уроки", icon: BookText, description: "Лекции и материалы" },
  { key: "tests", label: "Тесты", icon: ClipboardCheck, description: "Контроль знаний" },
  { key: "practice", label: "Практика", icon: FlaskConical, description: "Лаборатории" },
  { key: "mentor", label: "AI-наставник", icon: Bot, description: "Подсказки на лекции" },
  { key: "profile", label: "Профиль", icon: User, description: "Прогресс и достижения" },
];

/** Компактная шапка кабинета (xl): без перегруза на средних экранах. */
export const studentHeaderNavKeys: StudentQuickNavKey[] = [
  "dashboard",
  "course",
  "lessons",
  "tests",
  "practice",
];

/** Нижняя панель мобильного кабинета (< lg). */
export const studentBottomNavKeys: StudentQuickNavKey[] = [
  "dashboard",
  "course",
  "lessons",
  "tests",
  "practice",
  "mentor",
  "profile",
];

/** Дополнительные разделы кабинета (sidebar «Ещё»). */
export const studentSecondaryNav: NavItem[] = [
  { href: "/dashboard/my-assignments", label: "Задания", icon: ClipboardList, description: "Отправки на проверку" },
  { href: "/dashboard/certificate", label: "Сертификат", icon: Award, description: "PDF и верификация" },
  { href: "/dashboard/reviews", label: "Отзывы", icon: MessageSquare, description: "Оценка курса" },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings, description: "Пароль и интересы" },
];

/** Главные разделы админки (шапка, mobile chips, верх sidebar). */
export const adminNavPrimary: NavItem[] = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, description: "Admin overview" },
  { href: "/admin/users", label: "Студенты", icon: Users, description: "Аккаунты и прогресс" },
  { href: "/admin/modules", label: "Контент", icon: FolderOpen, description: "Модули, лекции, тесты, практики" },
  { href: "/admin/submissions", label: "Проверка практик", icon: ClipboardList, description: "Работы студентов" },
  { href: "/admin/certificates", label: "Сертификаты", icon: Award, description: "Реестр выдачи" },
  { href: "/admin/profile", label: "Аудит", icon: Shield, description: "Безопасность платформы" },
];

/** Детальные ссылки контента (sidebar админки, drawer, palette). */
export const adminNavContent: NavItem[] = [
  { href: "/admin/modules", label: "Модули", icon: BookOpen, description: "Структура курса" },
  { href: "/admin/lessons", label: "Лекции", icon: BookText, description: "Контент уроков" },
  { href: "/admin/tests", label: "Тесты", icon: ClipboardCheck, description: "Вопросы и баллы" },
  { href: "/admin/practical-tasks", label: "Практики", icon: FlaskConical, description: "Лаборатории" },
];

export const adminNavSecondary: NavItem[] = [
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquare, description: "Модерация" },
];

/** Полный список админ-маршрутов (palette, drawer, обратная совместимость). */
export const adminNav: NavItem[] = [
  ...adminNavPrimary,
  ...adminNavContent.filter((item) => !adminNavPrimary.some((p) => p.href === item.href)),
  ...adminNavSecondary,
];

export const commandPaletteStudentActions: NavItem[] = [
  { href: "/dashboard", label: "Кабинет", icon: LayoutDashboard, description: "Обзор" },
  { href: "/dashboard/course", label: "Курс", icon: BookOpen, description: "Модули" },
  { href: "/dashboard/my-assignments", label: "Задания", icon: ClipboardList },
  { href: "/dashboard/certificate", label: "Сертификат", icon: Award },
  { href: "/dashboard/profile", label: "Профиль", icon: User },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export const commandPaletteAdminAction: NavItem = {
  href: "/admin",
  label: "Админ-панель",
  icon: Shield,
  description: "Только для ADMIN",
};

export const commandPaletteActions: NavItem[] = [
  ...commandPaletteStudentActions,
  commandPaletteAdminAction,
];
