import { redirect } from "next/navigation";
import { getContinueModuleIdForUser } from "@/lib/continue-module";
import { requireAuth } from "@/lib/permissions";

export default async function ContinueTestPage() {
  const session = await requireAuth();
  const moduleId = await getContinueModuleIdForUser(session.user.id);
  if (!moduleId) redirect("/dashboard/course");
  redirect(`/dashboard/course/${moduleId}/test`);
}
