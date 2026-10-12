import { NextResponse } from "next/server";
import { renderAuditPdf } from "@/lib/pdf";
import { getSessionUser } from "@/lib/session";
import { readDb } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to export an audit." }, { status: 401 });
  const { id } = await context.params;
  const db = readDb();
  const audit = db.audits.find((item) => item.id === id && item.userId === user.id);
  const settings = db.settings.find((item) => item.userId === user.id);
  if (!audit || !settings) return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  const bytes = await renderAuditPdf(audit, settings);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="missed-call-audit-${audit.businessName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`,
    },
  });
}
