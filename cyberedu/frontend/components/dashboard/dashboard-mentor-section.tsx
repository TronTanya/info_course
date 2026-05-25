"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AiMentorChatLazy as AiMentorChat } from "@/components/ai/ai-mentor-chat-lazy";
import { DashboardAiWidget } from "@/components/dashboard/dashboard-ai-widget";
import {
  buildDashboardAIMentorContextInput,
  buildDashboardWeakTopics,
} from "@/lib/dashboard-ai-widget";
import { buildDashboardMentorLabels } from "@/lib/ai/mentor-ui/dashboard-context";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

type DashboardMentorContextValue = {
  openChat: (prompt: string) => void;
};

const DashboardMentorContext = createContext<DashboardMentorContextValue | null>(null);

export function useDashboardMentorChat(): DashboardMentorContextValue {
  const ctx = useContext(DashboardMentorContext);
  if (!ctx) {
    throw new Error("useDashboardMentorChat must be used within DashboardMentorSection");
  }
  return ctx;
}

export type DashboardMentorSectionProps = {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  aiConfigured?: boolean;
  children: ReactNode;
};

/** Общее состояние чата + FAB; виджет в сетке — через `DashboardMentorWidgetSlot`. */
export function DashboardMentorSection({
  stats,
  modules,
  aiConfigured = true,
  children,
}: DashboardMentorSectionProps) {
  const [chatOpenSeq, setChatOpenSeq] = useState<number | undefined>(undefined);
  const [bootPrompt, setBootPrompt] = useState<string | null>(null);

  const weakTopics = useMemo(() => buildDashboardWeakTopics(stats, modules), [stats, modules]);
  const mentorContext = useMemo(
    () => buildDashboardAIMentorContextInput(stats, modules, weakTopics),
    [stats, modules, weakTopics],
  );
  const contextLabels = useMemo(
    () => buildDashboardMentorLabels(stats, modules),
    [stats, modules],
  );

  const openChat = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setBootPrompt(trimmed);
    setChatOpenSeq((n) => (n ?? 0) + 1);
  }, []);

  const value = useMemo(() => ({ openChat }), [openChat]);

  return (
    <DashboardMentorContext.Provider value={value}>
      {children}
      <AiMentorChat
        moduleId={stats.currentModuleId}
        aiConfigured={aiConfigured}
        contextLabels={contextLabels}
        mentorContext={mentorContext}
        openSignal={chatOpenSeq}
        bootPrompt={bootPrompt}
      />
    </DashboardMentorContext.Provider>
  );
}

export function DashboardMentorWidgetSlot({
  stats,
  modules,
  aiConfigured = true,
  compact = false,
  className,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  aiConfigured?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { openChat } = useDashboardMentorChat();
  return (
    <DashboardAiWidget
      stats={stats}
      modules={modules}
      aiConfigured={aiConfigured}
      onOpenChat={openChat}
      compact={compact}
      className={className}
    />
  );
}
