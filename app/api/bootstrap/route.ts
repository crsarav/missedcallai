import { NextResponse } from "next/server";
import { bootstrapFor } from "@/lib/engine";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to open the workspace." }, { status: 401 });
  return NextResponse.json(bootstrapFor(user));
}
