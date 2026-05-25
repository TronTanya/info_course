import { redirect } from "next/navigation";
import { DASHBOARD_MENTOR_PAGE_PATH } from "@/lib/dashboard-ai-widget";

/** Короткий URL `/mentor` → страница наставника в кабинете. */
export default function MentorShortcutPage() {
  redirect(DASHBOARD_MENTOR_PAGE_PATH);
}
