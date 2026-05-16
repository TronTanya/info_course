import type { Role } from "@prisma/client";

export type { Role };

export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  image: string | null;
};
