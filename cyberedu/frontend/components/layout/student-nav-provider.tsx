"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  extractModuleIdFromPath,
  readLastModuleId,
  writeLastModuleId,
} from "@/lib/student-nav-module-id";

const StudentNavContext = createContext<string | null>(null);

export function StudentNavProvider({
  seedModuleId = null,
  children,
}: {
  seedModuleId?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const fromPath = extractModuleIdFromPath(pathname);
  const [stored, setStored] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (fromPath) {
      writeLastModuleId(fromPath);
      setStored(fromPath);
      return;
    }
    if (seedModuleId) {
      writeLastModuleId(seedModuleId);
      setStored(seedModuleId);
      return;
    }
    setStored(readLastModuleId());
  }, [fromPath, seedModuleId]);

  const moduleId = useMemo(
    () => fromPath ?? stored ?? seedModuleId ?? null,
    [fromPath, stored, seedModuleId],
  );

  return <StudentNavContext.Provider value={moduleId}>{children}</StudentNavContext.Provider>;
}

export function useStudentNavContextModuleId(): string | null {
  return useContext(StudentNavContext);
}
