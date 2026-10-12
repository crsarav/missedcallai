import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";
import { signup } from "@/lib/engine";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { ActionError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      company?: string;
    };
    const user = await signup({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
      company: body.company ?? "",
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, signSession(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof ActionError ? error.message : "Could not create the account.";
    const status = error instanceof ActionError ? error.status : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
