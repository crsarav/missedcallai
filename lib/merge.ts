import type { CallLog, Prospect, Settings } from "./types";
import { weekdayName, windowTime } from "./time";

const JOB: Record<Prospect["trade"], string> = {
  HVAC: "service call",
  Plumbing: "leak call",
  Roofing: "roof inspection",
  Electrical: "panel call",
};

export function mergeText(template: string, tokens: Record<string, string>) {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, key: string) => tokens[key] ?? "");
}

export function tokensFor(
  prospect: Prospect,
  settings: Settings,
  calls: CallLog[],
) {
  const latest = [...calls]
    .filter((call) => call.prospectId === prospect.id)
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1);
  return {
    first_name: prospect.ownerFirst,
    company: prospect.company,
    day: latest ? weekdayName(latest.at, settings.timezone) : "this morning",
    time: latest ? windowTime(latest.window) : "7:42 AM",
    job: JOB[prospect.trade],
    trade: prospect.trade,
    city: prospect.city,
    signature: settings.signature,
    sender: settings.senderName,
    senderCompany: settings.senderCompany,
  };
}

export function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function auditMath(input: {
  monthlyInbound: number;
  unansweredShare: number;
  avgTicket: number;
}) {
  const missed = input.monthlyInbound * (input.unansweredShare / 100);
  const lost = missed * input.avgTicket;
  return { missed, lost };
}
