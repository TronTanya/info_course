import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Bot,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
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

/** Публичный сайт (лендинг, about, reviews). */
export const publicNavLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "/#what-you-learn", label: "Программа" },
  { href: "/#modules", label: "Модули" },
  { href: "/#how-it-works", label: "Обучение" },
  { href: "/#practice-lab", label: "Практика" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/about", label: "О проекте" },
];

export const guestNavLinks: { href: string; label: string }[] = [
  { href: "/", label: "Главная" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/about", label: "О проекте" },
];

/** Основная навигация кабинета (sidebar + bottom bar). */
export const studentQuickNav: QuickNavItem[] = [
  { key: "dashboard", label: "Кабинет", icon: LayoutDashboard, description: "Обзор и прогресс" },
  { key: "course", label: "Курс", icon: BookOpen, description: "Модули программы" },
  { key: "tests", label: "Тесты", icon: ClipboardCheck, description: "Контроль знаний" },
  { key: "practice", label: "Практика", icon: FlaskConical, description: "Лаборатории" },
  { key: "mentor", label: "AI-наставник", icon: Bot, description: "Лекция и подсказки" },
  { key: "profile", label: "Профиль", icon: User, description: "Прогресс и достижения" },
];

/** Дополнительные разделы кабинета. */
export const studentSecondaryNav: NavItem[] = [
  { href: "/dashboard/my-assignments", label: "Задания", icon: ClipboardList, description: "Отправки на проверку" },
  { href: "/dashboard/certificate", label: "Сертификат", icon: Award, description: "PDF и верификация" },
  { href: "/dashboard/reviews", label: "Отзывы", icon: MessageSquare, description: "Оценка курса" },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings, description: "Пароль и интересы" },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, description: "KPI и активность" },
  { href: "/admin/users", label: "Пользователи", icon: Users, description: "Аккаунты и прогресс" },
  { href: "/admin/modules", label: "Модули", icon: BookOpen, description: "Структура курса" },
  { href: "/admin/lessons", label: "Лекции", icon: BookOpen, description: "Контент уроков" },
  { href: "/admin/tests", label: "Тесты", icon: ClipboardCheck, description: "Вопросы и баллы" },
  { href: "/admin/practical-tasks", label: "Практика", icon: FlaskConical, description: "Лаборатории" },
  { href: "/admin/submissions", label: "Проверка", icon: ClipboardList, description: "Работы студентов" },
  { href: "/admin/certificates", label: "Сертификаты", icon: Award, description: "Реестр выдачи" },
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquare, description: "Модерация" },
  { href: "/admin/profile", label: "Security", icon: Shield, description: "Обзор платформы" },
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
