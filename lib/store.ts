import fs from "fs";
import path from "path";
import { hashPassword } from "./auth";
import { CATALOG } from "./catalog";
import {
  DEMO_COMPANY,
  DEMO_EMAIL,
  DEMO_NAME,
  DEMO_PASSWORD,
  DEMO_PHONE,
  DEFAULT_BODY,
  DEFAULT_SUBJECT,
} from "./demo";
import type {
  Activity,
  Audit,
  CallLog,
  CatalogBusiness,
  Database,
  EmailTemplate,
  Prospect,
  ProspectStatus,
  Settings,
  User,
} from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export class ActionError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function prospectFrom(item: CatalogBusiness, userId: string, status: ProspectStatus, createdAt: string): Prospect {
  return {
    ...item,
    id: `p_${item.id}`,
    catalogId: item.id,
    userId,
    status,
    createdAt,
  };
}

function activity(
  partial: Omit<Activity, "id" | "userId"> & { userId: string },
): Activity {
  return { id: `a_${partial.at}`, ...partial };
}

export function defaultSettings(user: Pick<User, "id" | "name" | "email" | "company">, phone = ""): Settings {
  return {
    userId: user.id,
    senderName: user.name,
    senderCompany: user.company,
    senderPhone: phone,
    senderEmail: user.email,
    signature: [user.name, user.company, phone].filter(Boolean).join("\n"),
    weeklyEmailCap: 100,
    timezone: "America/New_York",
  };
}

export function defaultTemplate(userId: string): EmailTemplate {
  return { userId, subject: DEFAULT_SUBJECT, body: DEFAULT_BODY };
}

function seed(): Database {
  const userId = "user_demo";
  const user: User = {
    id: userId,
    name: DEMO_NAME,
    email: DEMO_EMAIL,
    passwordHash: hashPassword(DEMO_PASSWORD),
    company: DEMO_COMPANY,
  };
  const byId = Object.fromEntries(CATALOG.map((item) => [item.id, item]));
  const prospects: Prospect[] = [
    prospectFrom(byId.hearthline, userId, "qualified", "2026-10-07T12:05:00.000Z"),
    prospectFrom(byId.redclay, userId, "new", "2026-10-07T12:06:00.000Z"),
    prospectFrom(byId.lantern, userId, "qualified", "2026-10-08T15:20:00.000Z"),
    prospectFrom(byId.switchcedar, userId, "new", "2026-10-09T13:40:00.000Z"),
  ];
  const calls: CallLog[] = [
    {
      id: "c_hearth_1",
      userId,
      prospectId: "p_hearthline",
      outcome: "Voicemail",
      window: "morning",
      at: "2026-10-08T11:42:00.000Z",
    },
    {
      id: "c_red_1",
      userId,
      prospectId: "p_redclay",
      outcome: "Rang out",
      window: "midday",
      at: "2026-10-08T16:10:00.000Z",
    },
    {
      id: "c_lantern_1",
      userId,
      prospectId: "p_lantern",
      outcome: "Voicemail",
      window: "evening",
      at: "2026-10-09T21:28:00.000Z",
    },
  ];
  const audit: Audit = {
    id: "audit_peach",
    userId,
    businessName: "Peachtree Comfort Co.",
    city: "Alpharetta",
    trade: "HVAC",
    monthlyInbound: 80,
    unansweredShare: 35,
    avgTicket: 450,
    calls: [
      { time: "7:41 AM", caller: "New customer, no cool", answered: false, note: "Voicemail, no callback logged" },
      { time: "7:52 AM", caller: "Maintenance renewal", answered: true, note: "Booked" },
      { time: "12:06 PM", caller: "Water leaking at air handler", answered: false, note: "Rang six times" },
      { time: "12:18 PM", caller: "Thermostat blank", answered: false, note: "Mailbox greeting" },
      { time: "5:22 PM", caller: "After-hours no heat", answered: false, note: "Hung up on greeting" },
    ],
    createdAt: "2026-10-10T18:00:00.000Z",
  };
  return {
    users: [user],
    prospects,
    calls,
    emails: [
      {
        id: "e_hearth",
        userId,
        prospectId: "p_hearthline",
        subject: "Maya, I called Hearthline Heating & Air Wednesday",
        body: "Sample send already recorded in the workspace.",
        status: "sent",
        scheduledFor: "2026-10-09T10:45:00.000Z",
        sentAt: "2026-10-09T10:46:00.000Z",
        createdAt: "2026-10-08T20:00:00.000Z",
      },
    ],
    sequences: [
      {
        id: "s_hearth",
        userId,
        prospectId: "p_hearthline",
        startedAt: "2026-10-09T10:50:00.000Z",
        status: "active",
        steps: [
          {
            day: 1,
            channel: "sms",
            provider: "Twilio",
            status: "sent",
            sentAt: "2026-10-09T10:51:00.000Z",
            preview: "Maya, this is Pradeepa Saravanan — I called Hearthline Heating & Air earlier about missed inbound calls.",
          },
          { day: 5, channel: "voicemail", provider: "DropCowboy", status: "pending" },
          { day: 8, channel: "sms", provider: "Twilio", status: "pending" },
        ],
      },
    ],
    audits: [audit],
    activity: [
      activity({
        userId,
        at: "2026-10-10T18:02:00.000Z",
        actor: DEMO_NAME,
        dept: "HVAC",
        module: "Audits",
        summary: "Saved a five-call audit for Peachtree Comfort Co.",
        source: "Audit",
        status: "Ready",
      }),
      activity({
        userId,
        at: "2026-10-09T10:51:00.000Z",
        actor: DEMO_NAME,
        dept: "HVAC",
        module: "Follow-up",
        summary: "Day 1 SMS recorded for Hearthline Heating & Air",
        source: "Twilio",
        status: "Sent",
      }),
      activity({
        userId,
        at: "2026-10-09T10:46:00.000Z",
        actor: DEMO_NAME,
        dept: "HVAC",
        module: "Email",
        summary: "Morning email recorded for Maya Chen",
        source: "Gmail",
        status: "Sent",
      }),
      activity({
        userId,
        at: "2026-10-09T21:28:00.000Z",
        actor: DEMO_NAME,
        dept: "Roofing",
        module: "Calls",
        summary: "Voicemail at Lantern Roofing — marked qualified",
        source: "Protocol",
        status: "Qualified",
      }),
      activity({
        userId,
        at: "2026-10-08T16:10:00.000Z",
        actor: DEMO_NAME,
        dept: "Plumbing",
        module: "Calls",
        summary: "Red Clay Plumbing rang out at midday",
        source: "Protocol",
        status: "Logged",
      }),
      activity({
        userId,
        at: "2026-10-07T12:06:00.000Z",
        actor: DEMO_NAME,
        dept: "Lists",
        module: "Lists",
        summary: "Added 4 independent shops from the Alpharetta book",
        source: "List engine",
        status: "Added",
      }),
    ].sort((a, b) => b.at.localeCompare(a.at)),
    settings: [defaultSettings(user, DEMO_PHONE)],
    templates: [defaultTemplate(userId)],
  };
}

function write(db: Database) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function readDb(): Database {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw) as Database;
  } catch {
    const db = seed();
    write(db);
    return db;
  }
}

let chain: Promise<unknown> = Promise.resolve();

export function mutate<T>(fn: (db: Database) => T): Promise<T> {
  const task = chain.then(() => {
    const db = readDb();
    const result = fn(db);
    write(db);
    return result;
  });
  chain = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}
