import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auditMath, money } from "./merge";
import type { Audit, Settings } from "./types";

const clean = (value: string) => value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();

export async function renderAuditPdf(audit: Audit, settings: Settings) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const purple = rgb(0.416, 0.239, 0.91);
  const ink = rgb(0.106, 0.078, 0.188);
  const muted = rgb(0.36, 0.33, 0.44);
  const { missed, lost } = auditMath(audit);

  page.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: purple });
  page.drawText("MissedCallAI", { x: 40, y: 762, size: 14, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Missed-call audit", { x: 160, y: 762, size: 12, font, color: rgb(1, 1, 1) });

  let y = 710;
  page.drawText(clean(audit.businessName), { x: 40, y, size: 22, font: bold, color: ink });
  y -= 22;
  page.drawText(clean(`${audit.trade}  |  ${audit.city}`), { x: 40, y, size: 11, font, color: muted });
  y -= 36;

  page.drawText("Five-call sample", { x: 40, y, size: 13, font: bold, color: purple });
  y -= 22;
  for (const call of audit.calls) {
    const line = `${call.time || "-"}   ${call.answered ? "Answered" : "Missed"}   ${call.caller || "Unknown caller"}`;
    page.drawText(clean(line), { x: 40, y, size: 10, font: bold, color: ink });
    y -= 14;
    page.drawText(clean(call.note || "No note"), { x: 52, y, size: 10, font, color: muted });
    y -= 18;
  }

  y -= 8;
  page.drawText("Assumptions you set", { x: 40, y, size: 13, font: bold, color: purple });
  y -= 20;
  const assumptions = [
    `Monthly inbound calls: ${audit.monthlyInbound}`,
    `Unanswered share: ${audit.unansweredShare}%`,
    `Average ticket: ${money(audit.avgTicket)}`,
  ];
  for (const line of assumptions) {
    page.drawText(clean(line), { x: 40, y, size: 11, font, color: ink });
    y -= 16;
  }

  y -= 10;
  page.drawRectangle({ x: 36, y: y - 78, width: 540, height: 96, color: rgb(0.965, 0.953, 0.937) });
  page.drawText("What those rings are worth", { x: 52, y: y - 8, size: 12, font: bold, color: purple });
  page.drawText(`${missed.toFixed(1)} missed calls each month`, {
    x: 52,
    y: y - 32,
    size: 12,
    font,
    color: ink,
  });
  page.drawText(clean(`${money(lost)} left on the table each month`), {
    x: 52,
    y: y - 54,
    size: 16,
    font: bold,
    color: ink,
  });
  y -= 110;

  const note =
    "Missed calls are inbound volume times the unanswered share. Revenue is that count times the average ticket. This page is a conversation starter, not a guarantee of recovered jobs.";
  y = drawWrapped(page, note, 40, y, 520, font, 10, muted);
  y -= 16;
  page.drawText(clean(settings.senderName), { x: 40, y, size: 11, font: bold, color: ink });
  y -= 14;
  page.drawText(clean(`${settings.senderCompany}   ${settings.senderPhone}`), {
    x: 40,
    y,
    size: 10,
    font,
    color: muted,
  });

  return doc.save();
}

function drawWrapped(
  page: import("pdf-lib").PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: import("pdf-lib").PDFFont,
  size: number,
  color: import("pdf-lib").RGB,
) {
  const words = clean(text).split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      page.drawText(line, { x, y: cursor, size, font, color });
      cursor -= size + 4;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cursor, size, font, color });
    cursor -= size + 4;
  }
  return cursor;
}
