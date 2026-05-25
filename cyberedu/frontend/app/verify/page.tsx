import { redirect } from "next/navigation";

/** Каноническая форма ввода — страница реестра. */
export default function VerifyIndexPage() {
  redirect("/certificate/verify");
}
