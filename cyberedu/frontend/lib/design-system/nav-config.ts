import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard, description: "Сводка и быстрые действия" },
  { href: "/dashboard/course", label: "Курс", icon: BookOpen, description: "Модули и прогресс" },
  { href: "/dashboard/profile", label: "Профиль", icon: User, description: "Данные и достижения" },
  { href: "/dashboard/my-assignments", label: "Задания", icon: ClipboardList, description: "Практические работы" },
  { href: "/dashboard/certificate", label: "Сертификат", icon: Award, description: "PDF и верификация" },
  { href: "/dashboard/reviews", label: "Отзывы", icon: MessageSquare, description: "Оценка курса" },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings, description: "Безопасность" },
];

export const adminNav: NavItem[] = [
  { href: "/admin/profile", label: "Security", icon: LayoutDashboard, description: "Обзор платформы" },
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, description: "KPI и активность" },
  { href: "/admin/users", label: "Пользователи", icon: Users, description: "Аккаунты и прогресс" },
  { href: "/admin/modules", label: "Модули", icon: BookOpen, description: "Структура курса" },
  { href: "/admin/submissions", label: "Проверка", icon: ClipboardList, description: "Практические работы" },
  { href: "/admin/certificates", label: "Сертификаты", icon: Award, description: "Реестр выдачи" },
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquare, description: "Модерация" },
];

export const commandPaletteActions: NavItem[] = [
  ...studentNav,
  { href: "/admin", label: "Админ-панель", icon: Shield, description: "Только для ADMIN" },
];
