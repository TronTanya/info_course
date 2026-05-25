"use client";

import { CourseRouteError } from "@/components/course/course-route-error";

export default function CourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <CourseRouteError error={error} reset={reset} />;
}
