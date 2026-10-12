import { randomUUID } from "crypto";
import { verifyPassword, hashPassword } from "./auth";
import { CATALOG } from "./catalog";
import { auditMath, mergeText, tokensFor } from "./merge";
import { isQualified, qualifyReasons } from "./qualify";
import { ActionError, defaultSettings, defaultTemplate, mutate, readDb } from "./store";
import { formatWhen, isEmailWindow, nextEmailSlot } from "./time";
import type {
  AuditCall,
  Bootstrap,
  CallOutcome,
  CallWindow,
  Database,
  Integrations,
  Prospect,
  ProspectStatus,
  SequenceEnrollment,
  Stats,
  Trade,
  User,
} from "./types";

const TRADES: Trade[] = ["HVAC", "Plumbing", "Roofing", "Electrical"];
const OUTCOMES: CallOutcome[] = ["Answered", "Voicemail", "Rang out", "Full mailbox"];
const WINDOWS: CallWindow[] = ["morning", "midday", "evening"];

const STEP_COPY: Record<1 | 5 | 8, string> = {
  1: "{{first_name}}, this is {{sender}} — I called {{company}} earlier about missed inbound calls. If a callback is useful, reply here. Reply STOP to opt out.",
  5: "Hi {{first_name}}, {{sender}} with {{senderCompany}}. I called about the jobs {{company}} misses when the phone rings during a {{job}}. I can send a one-page audit. If now is not the time, you can ignore this.",
  8: "{{first_name}}, last note from {{sender}}. Happy to share the missed-call numbers for {{company}} and stop there. Reply STOP to opt out.",
};

function integrations(): Integrations {
  return {
    gmail: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    dropcowboy: Boolean(process.env.DROPCOWBOY_API_KEY),
    outscraper: Boolean(process.env.OUTSCRAPER_API_KEY),
    delivery: "simulation",
  };
}

function owned<T extends { userId: string }>(rows: T[], userId: string) {
  return rows.filter((row) => row.userId === userId);
}

function emailsThisWeek(db: Database, userId: string, now = new Date()) {
  const start = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return owned(db.emails, userId).filter(
    (email) => email.status === "sent" && email.sentAt && new Date(email.sentAt).getTime() >= start,
  ).length;
}

export function statsFor(db: Database, userId: string): Stats {
  const prospects = owned(db.prospects, userId);
  const emails = owned(db.emails, userId);
  const sequences = owned(db.sequences, userId);
  const settings = db.settings.find((item) => item.userId === userId);
  const sent = emails.filter((email) => email.status === "sent").length;
  const replies = prospects.filter((item) => item.status === "replied" || item.status === "booked").length;
  const booked = prospects.filter((item) => item.status === "booked").length;
  return {
    prospects: prospects.length,
    qualified: prospects.filter((item) => item.status === "qualified").length,
    discarded: prospects.filter((item) => item.status === "discarded").length,
    suppressed: prospects.filter((item) => item.status === "suppressed").length,
    emailsThisWeek: emailsThisWeek(db, userId),
    emailCap: settings?.weeklyEmailCap ?? 100,
    openSequences: sequences.filter((item) => item.status === "active").length,
    replies,
    booked,
    replyRate: sent ? replies / sent : 0,
    trialRate: replies ? booked / replies : 0,
  };
}

export function bootstrapFor(user: Pick<User, "id" | "name" | "email" | "company">): Bootstrap {
  const db = readDb();
  const settings = db.settings.find((item) => item.userId === user.id) ?? defaultSettings(user);
  const template = db.templates.find((item) => item.userId === user.id) ?? defaultTemplate(user.id);
  return {
    user: { id: user.id, name: user.name, email: user.email, company: user.company },
    prospects: owned(db.prospects, user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    calls: owned(db.calls, user.id).sort((a, b) => b.at.localeCompare(a.at)),
    emails: owned(db.emails, user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    sequences: owned(db.sequences, user.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    audits: owned(db.audits, user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    activity: owned(db.activity, user.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 80),
    settings,
    template,
    stats: statsFor(db, user.id),
    integrations: integrations(),
  };
}

function log(
  db: Database,
  userId: string,
  entry: { actor: string; dept: string; module: string; summary: string; source: string; status: string },
) {
  db.activity.unshift({ id: randomUUID(), userId, at: new Date().toISOString(), ...entry });
  db.activity = db.activity.slice(0, 300);
}

function requireProspect(db: Database, userId: string, prospectId: string) {
  const prospect = db.prospects.find((item) => item.id === prospectId && item.userId === userId);
  if (!prospect) throw new ActionError("That shop is not in this workspace.");
  return prospect;
}

function settingsOf(db: Database, user: User) {
  return db.settings.find((item) => item.userId === user.id) ?? defaultSettings(user);
}

function applyOutcome(prospect: Prospect, answeredCount: number, outcome: CallOutcome): ProspectStatus {
  if (["suppressed", "replied", "booked"].includes(prospect.status)) return prospect.status;
  if (answeredCount >= 3) return "discarded";
  if (outcome === "Voicemail" || outcome === "Full mailbox") return "qualified";
  return prospect.status;
}

function stepTemplate(day: 1 | 5 | 8) {
  return STEP_COPY[day];
}

function freshSteps(): SequenceEnrollment["steps"] {
  return [
    { day: 1, channel: "sms", provider: "Twilio", status: "pending" },
    { day: 5, channel: "voicemail", provider: "DropCowboy", status: "pending" },
    { day: 8, channel: "sms", provider: "Twilio", status: "pending" },
  ];
}

function asTrade(value: unknown): Trade {
  if (typeof value === "string" && TRADES.includes(value as Trade)) return value as Trade;
  throw new ActionError("Choose HVAC, plumbing, roofing, or electrical.");
}

function asString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new ActionError(`${label} is required.`);
  return value.trim();
}

export async function login(email: string, password: string) {
  const user = readDb().users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new ActionError("Those credentials don't match.", 401);
  }
  return user;
}

export async function signup(input: { name: string; email: string; password: string; company: string }) {
  const name = asString(input.name, "Name");
  const email = asString(input.email, "Email").toLowerCase();
  const company = asString(input.company, "Company");
  const password = asString(input.password, "Password");
  if (!email.includes("@")) throw new ActionError("Enter a valid email.");
  if (password.length < 8) throw new ActionError("Use at least 8 characters.");
  return mutate((db) => {
    if (db.users.some((item) => item.email === email)) {
      throw new ActionError("An account with that email already exists.");
    }
    const user: User = {
      id: randomUUID(),
      name,
      email,
      company,
      passwordHash: hashPassword(password),
    };
    db.users.push(user);
    db.settings.push(defaultSettings(user));
    db.templates.push(defaultTemplate(user.id));
    log(db, user.id, {
      actor: user.name,
      dept: "Workspace",
      module: "Settings",
      summary: "Opened a new workspace",
      source: "Account",
      status: "Ready",
    });
    return user;
  });
}

export async function runAction(userId: string, body: Record<string, unknown>) {
  const type = body.type;
  if (type === "search") return search(userId, body);
  return mutate((db) => {
    const user = db.users.find((item) => item.id === userId);
    if (!user) throw new ActionError("Sign in again.", 401);
    switch (type) {
      case "add":
        return addProspects(db, user, body);
      case "createProspect":
        return createProspect(db, user, body);
      case "logCall":
        return logCall(db, user, body);
      case "saveTemplate":
        return saveTemplate(db, user, body);
      case "queueEmails":
        return queueEmails(db, user, body);
      case "releaseEmails":
        return releaseEmails(db, user);
      case "enroll":
        return enroll(db, user, body);
      case "sendStep":
        return sendStep(db, user, body);
      case "inbound":
        return inbound(db, user, body);
      case "book":
        return book(db, user, body);
      case "saveAudit":
        return saveAudit(db, user, body);
      case "saveSettings":
        return saveSettings(db, user, body);
      default:
        throw new ActionError("Unknown action.");
    }
  });
}

function search(userId: string, body: Record<string, unknown>) {
  const trade = asTrade(body.trade);
  const city = typeof body.city === "string" ? body.city.trim().toLowerCase() : "";
  const db = readDb();
  const existing = new Set(
    owned(db.prospects, userId)
      .map((item) => item.catalogId)
      .filter(Boolean),
  );
  const matches = CATALOG.filter((item) => {
    if (item.trade !== trade) return false;
    if (!city) return true;
    return item.city.toLowerCase().includes(city) || city.includes(item.city.toLowerCase());
  });
  const qualified = matches
    .filter((item) => isQualified(item))
    .map((item) => ({ ...item, inWorkspace: existing.has(item.id) }));
  const rejected = matches
    .filter((item) => !isQualified(item))
    .map((item) => ({ ...item, reasons: qualifyReasons(item) }));
  return {
    ok: true,
    message: `${qualified.length} qualified, ${rejected.length} filtered out.`,
    qualified,
    rejected,
  };
}

function addProspects(db: Database, user: User, body: Record<string, unknown>) {
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];
  if (!ids.length) throw new ActionError("Select at least one shop.");
  let added = 0;
  for (const id of ids) {
    const item = CATALOG.find((shop) => shop.id === id);
    if (!item) continue;
    if (!isQualified(item)) throw new ActionError(`${item.company} does not pass the qualifying filters.`);
    const already = db.prospects.some((prospect) => prospect.userId === user.id && prospect.catalogId === id);
    if (already) continue;
    db.prospects.push({
      ...item,
      id: randomUUID(),
      catalogId: item.id,
      userId: user.id,
      status: "new",
      createdAt: new Date().toISOString(),
    });
    added += 1;
  }
  log(db, user.id, {
    actor: user.name,
    dept: "Lists",
    module: "Lists",
    summary: `Added ${added} shop${added === 1 ? "" : "s"} to the workspace`,
    source: "List engine",
    status: "Added",
  });
  return { ok: true, message: added ? `Added ${added} to the call book.` : "Those shops were already in the book." };
}

function createProspect(db: Database, user: User, body: Record<string, unknown>) {
  const shop = {
    company: asString(body.company, "Company"),
    ownerFirst: asString(body.ownerFirst, "Owner first name"),
    ownerLast: typeof body.ownerLast === "string" ? body.ownerLast.trim() : "",
    trade: asTrade(body.trade),
    city: asString(body.city, "City"),
    state: "GA",
    phone: asString(body.phone, "Phone"),
    email: asString(body.email, "Email"),
    stars: Number(body.stars),
    reviews: Number(body.reviews),
    franchise: Boolean(body.franchise),
    claims247: Boolean(body.claims247),
  };
  if (!Number.isFinite(shop.stars) || !Number.isFinite(shop.reviews)) {
    throw new ActionError("Stars and reviews need to be numbers.");
  }
  const reasons = qualifyReasons(shop);
  if (reasons.length) throw new ActionError(reasons.join(". ") + ".");
  db.prospects.push({
    ...shop,
    id: randomUUID(),
    userId: user.id,
    status: "new",
    createdAt: new Date().toISOString(),
  });
  log(db, user.id, {
    actor: user.name,
    dept: shop.trade,
    module: "Lists",
    summary: `Added ${shop.company} by hand`,
    source: "List engine",
    status: "Added",
  });
  return { ok: true, message: `${shop.company} is in the call book.` };
}

function logCall(db: Database, user: User, body: Record<string, unknown>) {
  const prospect = requireProspect(db, user.id, asString(body.prospectId, "Shop"));
  const outcome = body.outcome as CallOutcome;
  const window = body.window as CallWindow;
  if (!OUTCOMES.includes(outcome)) throw new ActionError("Choose a call outcome.");
  if (!WINDOWS.includes(window)) throw new ActionError("Choose a call window.");
  if (["discarded", "suppressed"].includes(prospect.status)) {
    throw new ActionError("This shop is closed out of the call desk.");
  }
  const prior = db.calls.filter((call) => call.userId === user.id && call.prospectId === prospect.id);
  if (prior.length >= 3) throw new ActionError("This shop already has its three protocol calls.");
  const answered = prior.filter((call) => call.outcome === "Answered").length + (outcome === "Answered" ? 1 : 0);
  const nextStatus = applyOutcome(prospect, answered, outcome);
  prospect.status = nextStatus;
  db.calls.push({
    id: randomUUID(),
    userId: user.id,
    prospectId: prospect.id,
    outcome,
    window,
    at: new Date().toISOString(),
  });
  const statusLabel =
    nextStatus === "qualified" ? "Qualified" : nextStatus === "discarded" ? "Discarded" : "Logged";
  log(db, user.id, {
    actor: user.name,
    dept: prospect.trade,
    module: "Calls",
    summary: `${outcome} at ${prospect.company}`,
    source: "Protocol",
    status: statusLabel,
  });
  const message =
    nextStatus === "discarded"
      ? `${prospect.company} answered three times, so it left the book.`
      : nextStatus === "qualified"
        ? `${prospect.company} is qualified from a ${outcome.toLowerCase()}.`
        : `${outcome} logged for ${prospect.company}.`;
  return { ok: true, message };
}

function saveTemplate(db: Database, user: User, body: Record<string, unknown>) {
  const subject = asString(body.subject, "Subject");
  const text = asString(body.body, "Body");
  const current = db.templates.find((item) => item.userId === user.id);
  if (current) {
    current.subject = subject;
    current.body = text;
  } else {
    db.templates.push({ userId: user.id, subject, body: text });
  }
  return { ok: true, message: "Template saved." };
}

function queueEmails(db: Database, user: User, body: Record<string, unknown>) {
  const ids = Array.isArray(body.prospectIds)
    ? body.prospectIds.filter((id): id is string => typeof id === "string")
    : [];
  if (!ids.length) throw new ActionError("Choose at least one qualified shop.");
  const settings = settingsOf(db, user);
  const template = db.templates.find((item) => item.userId === user.id) ?? defaultTemplate(user.id);
  const now = new Date();
  const inWindow = isEmailWindow(now, settings.timezone);
  let sent = 0;
  let scheduled = 0;
  let blocked = 0;
  for (const id of ids) {
    const prospect = requireProspect(db, user.id, id);
    if (prospect.status !== "qualified") {
      throw new ActionError(`${prospect.company} needs a qualifying voicemail or mailbox greeting first.`);
    }
    const tokens = tokensFor(prospect, settings, owned(db.calls, user.id));
    const subject = mergeText(template.subject, tokens);
    const text = mergeText(template.body, tokens);
    const capHit = emailsThisWeek(db, user.id, now) >= settings.weeklyEmailCap;
    const status = capHit ? "blocked" : inWindow ? "sent" : "scheduled";
    const when = status === "scheduled" ? nextEmailSlot(now, settings.timezone) : now;
    db.emails.push({
      id: randomUUID(),
      userId: user.id,
      prospectId: prospect.id,
      subject,
      body: text,
      status,
      scheduledFor: when.toISOString(),
      sentAt: status === "sent" ? now.toISOString() : undefined,
      createdAt: now.toISOString(),
    });
    if (status === "sent") sent += 1;
    if (status === "scheduled") scheduled += 1;
    if (status === "blocked") blocked += 1;
    log(db, user.id, {
      actor: user.name,
      dept: prospect.trade,
      module: "Email",
      summary: `${status === "sent" ? "Recorded" : status === "scheduled" ? "Scheduled" : "Held"} email to ${prospect.ownerFirst} at ${prospect.company}`,
      source: "Gmail",
      status: status === "sent" ? "Sent" : status === "scheduled" ? "Scheduled" : "Blocked",
    });
  }
  const slot = formatWhen(nextEmailSlot(now, settings.timezone), settings.timezone);
  const message = blocked
    ? "The weekly cap of 100 is full, so nothing new was sent."
    : sent
      ? "Recorded in the workspace. Nothing left this machine."
      : `Scheduled for the next send window (${slot}).`;
  return { ok: true, message, sent, scheduled, blocked };
}

function releaseEmails(db: Database, user: User) {
  const settings = settingsOf(db, user);
  const now = new Date();
  let released = 0;
  for (const email of owned(db.emails, user.id)) {
    if (email.status !== "scheduled") continue;
    if (emailsThisWeek(db, user.id, now) >= settings.weeklyEmailCap) break;
    email.status = "sent";
    email.sentAt = now.toISOString();
    released += 1;
    const prospect = db.prospects.find((item) => item.id === email.prospectId);
    log(db, user.id, {
      actor: user.name,
      dept: prospect?.trade ?? "Email",
      module: "Email",
      summary: `Released a scheduled email${prospect ? ` for ${prospect.company}` : ""}`,
      source: "Gmail",
      status: "Sent",
    });
  }
  return {
    ok: true,
    message: released
      ? `Released ${released} scheduled email${released === 1 ? "" : "s"} inside the workspace.`
      : "No scheduled email is waiting.",
  };
}

function enroll(db: Database, user: User, body: Record<string, unknown>) {
  const ids = Array.isArray(body.prospectIds)
    ? body.prospectIds.filter((id): id is string => typeof id === "string")
    : [];
  if (!ids.length) throw new ActionError("Choose at least one qualified shop.");
  let count = 0;
  for (const id of ids) {
    const prospect = requireProspect(db, user.id, id);
    if (prospect.status !== "qualified" && prospect.status !== "replied") {
      throw new ActionError(`${prospect.company} is not qualified for follow-up.`);
    }
    const existing = db.sequences.find(
      (item) => item.userId === user.id && item.prospectId === id && item.status === "active",
    );
    if (existing) continue;
    db.sequences.push({
      id: randomUUID(),
      userId: user.id,
      prospectId: id,
      startedAt: new Date().toISOString(),
      status: "active",
      steps: freshSteps(),
    });
    count += 1;
    log(db, user.id, {
      actor: user.name,
      dept: prospect.trade,
      module: "Follow-up",
      summary: `Enrolled ${prospect.company} in day 1 / 5 / 8`,
      source: "Sequence",
      status: "Active",
    });
  }
  return { ok: true, message: count ? `Enrolled ${count} shop${count === 1 ? "" : "s"}.` : "Already enrolled." };
}

function sendStep(db: Database, user: User, body: Record<string, unknown>) {
  const enrollment = db.sequences.find(
    (item) => item.id === body.enrollmentId && item.userId === user.id,
  );
  if (!enrollment) throw new ActionError("That sequence is not in this workspace.");
  if (enrollment.status !== "active") throw new ActionError("This sequence is already stopped.");
  const day = Number(body.day) as 1 | 5 | 8;
  const step = enrollment.steps.find((item) => item.day === day);
  if (!step) throw new ActionError("That touchpoint does not exist.");
  if (step.status !== "pending") throw new ActionError("That touchpoint was already sent.");
  const earlier = enrollment.steps.filter((item) => item.day < day && item.status === "pending");
  if (earlier.length) throw new ActionError("Send the earlier touchpoint first.");
  const prospect = requireProspect(db, user.id, enrollment.prospectId);
  if (prospect.status === "suppressed" || prospect.status === "discarded") {
    throw new ActionError("This contact is suppressed.");
  }
  const settings = settingsOf(db, user);
  const preview = mergeText(stepTemplate(day), tokensFor(prospect, settings, owned(db.calls, user.id)));
  step.status = "sent";
  step.sentAt = new Date().toISOString();
  step.preview = preview;
  if (enrollment.steps.every((item) => item.status === "sent")) enrollment.status = "completed";
  log(db, user.id, {
    actor: user.name,
    dept: prospect.trade,
    module: "Follow-up",
    summary: `Day ${day} ${step.channel === "sms" ? "SMS" : "voicemail"} recorded for ${prospect.company}`,
    source: step.provider,
    status: "Sent",
  });
  return {
    ok: true,
    message: `Day ${day} recorded through ${step.provider}. Nothing left this machine.`,
  };
}

function halt(prospect: Prospect, enrollment: SequenceEnrollment | undefined, reason: "reply" | "stop" | "booked") {
  prospect.status = reason === "stop" ? "suppressed" : reason === "booked" ? "booked" : "replied";
  if (!enrollment || enrollment.status !== "active") return;
  enrollment.status = "halted";
  enrollment.haltReason = reason;
  for (const step of enrollment.steps) {
    if (step.status === "pending") step.status = "skipped";
  }
}

function inbound(db: Database, user: User, body: Record<string, unknown>) {
  const prospect = requireProspect(db, user.id, asString(body.prospectId, "Shop"));
  const kind = body.kind === "stop" ? "stop" : "reply";
  const enrollment = db.sequences.find(
    (item) => item.userId === user.id && item.prospectId === prospect.id && item.status === "active",
  );
  halt(prospect, enrollment, kind);
  log(db, user.id, {
    actor: user.name,
    dept: prospect.trade,
    module: "Follow-up",
    summary:
      kind === "stop"
        ? `STOP from ${prospect.company} — sequence halted`
        : `Reply from ${prospect.company} — sequence halted`,
    source: "Kill switch",
    status: kind === "stop" ? "Suppressed" : "Replied",
  });
  return {
    ok: true,
    message:
      kind === "stop"
        ? `${prospect.company} is suppressed. No further email, text, or voicemail.`
        : `${prospect.company} replied. The sequence is stopped.`,
  };
}

function book(db: Database, user: User, body: Record<string, unknown>) {
  const prospect = requireProspect(db, user.id, asString(body.prospectId, "Shop"));
  const enrollment = db.sequences.find(
    (item) => item.userId === user.id && item.prospectId === prospect.id && item.status === "active",
  );
  halt(prospect, enrollment, "booked");
  const recorded = db.sequences.find((item) => item.userId === user.id && item.prospectId === prospect.id);
  if (recorded && recorded.haltReason !== "stop") recorded.haltReason = "booked";
  log(db, user.id, {
    actor: user.name,
    dept: prospect.trade,
    module: "Follow-up",
    summary: `${prospect.company} moved to a live trial`,
    source: "Workspace",
    status: "Booked",
  });
  return { ok: true, message: `${prospect.company} is marked as a live trial.` };
}

function saveAudit(db: Database, user: User, body: Record<string, unknown>) {
  const callsRaw = Array.isArray(body.calls) ? body.calls : [];
  if (callsRaw.length !== 5) throw new ActionError("The audit needs five call rows.");
  const calls: AuditCall[] = callsRaw.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      time: typeof item.time === "string" ? item.time : "",
      caller: typeof item.caller === "string" ? item.caller : "",
      answered: Boolean(item.answered),
      note: typeof item.note === "string" ? item.note : "",
    };
  });
  const monthlyInbound = Number(body.monthlyInbound);
  const unansweredShare = Number(body.unansweredShare);
  const avgTicket = Number(body.avgTicket);
  if (![monthlyInbound, unansweredShare, avgTicket].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new ActionError("Inbound volume, unanswered share, and ticket size need to be zero or more.");
  }
  if (unansweredShare > 100) throw new ActionError("Unanswered share cannot pass 100%.");
  const audit = {
    id: randomUUID(),
    userId: user.id,
    businessName: asString(body.businessName, "Business name"),
    city: asString(body.city, "City"),
    trade: asTrade(body.trade),
    monthlyInbound,
    unansweredShare,
    avgTicket,
    calls,
    createdAt: new Date().toISOString(),
  };
  db.audits.unshift(audit);
  const { lost } = auditMath(audit);
  log(db, user.id, {
    actor: user.name,
    dept: audit.trade,
    module: "Audits",
    summary: `Audit saved for ${audit.businessName}`,
    source: "Audit",
    status: "Ready",
  });
  return { ok: true, message: "Audit saved. You can export the PDF.", id: audit.id, lost };
}

function saveSettings(db: Database, user: User, body: Record<string, unknown>) {
  const next = {
    userId: user.id,
    senderName: asString(body.senderName, "Sender name"),
    senderCompany: asString(body.senderCompany, "Company"),
    senderPhone: typeof body.senderPhone === "string" ? body.senderPhone.trim() : "",
    senderEmail: asString(body.senderEmail, "Sender email"),
    signature: asString(body.signature, "Signature"),
    weeklyEmailCap: 100,
    timezone: "America/New_York",
  };
  const current = db.settings.find((item) => item.userId === user.id);
  if (current) Object.assign(current, next);
  else db.settings.push(next);
  return { ok: true, message: "Sender details saved." };
}
