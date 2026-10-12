import { cookies } from "next/headers";
import { readSession } from "./auth";
import { readDb } from "./store";
import type { PublicUser } from "./types";

export const SESSION_COOKIE = "mca_session";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const userId = readSession(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = readDb().users.find((item) => item.id === userId);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, company: user.company };
}
