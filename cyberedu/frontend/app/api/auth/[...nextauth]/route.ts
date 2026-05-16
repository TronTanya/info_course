/**
 * @public NextAuth — sign-in, sign-out, session (без withApiGuard; фреймворк-обработчики).
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
