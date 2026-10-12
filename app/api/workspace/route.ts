import { NextResponse } from "next/server";
import { runAction } from "@/lib/engine";
import { getSessionUser } from "@/lib/session";
import { ActionError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to open the workspace." }, { status: 401 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await runAction(user.id, body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof ActionError ? error.message : "That did not work.";
    const status = error instanceof ActionError ? error.status : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
