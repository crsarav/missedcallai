import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";
import { login } from "@/lib/engine";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { ActionError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const user = await login(body.email ?? "", body.password ?? "");
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, signSession(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof ActionError ? error.message : "Could not sign in.";
    const status = error instanceof ActionError ? error.status : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
