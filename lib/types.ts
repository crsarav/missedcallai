export type Trade = "HVAC" | "Plumbing" | "Roofing" | "Electrical";

export type ProspectStatus =
  | "new"
  | "qualified"
  | "discarded"
  | "suppressed"
  | "replied"
  | "booked";

export type CallOutcome = "Answered" | "Voicemail" | "Rang out" | "Full mailbox";

export type CallWindow = "morning" | "midday" | "evening";

export type CatalogBusiness = {
  id: string;
  company: string;
  ownerFirst: string;
  ownerLast: string;
  trade: Trade;
  city: string;
  state: string;
  phone: string;
  email: string;
  stars: number;
  reviews: number;
  franchise: boolean;
  claims247: boolean;
};

export type Prospect = CatalogBusiness & {
  catalogId?: string;
  userId: string;
  status: ProspectStatus;
  createdAt: string;
};

export type CallLog = {
  id: string;
  userId: string;
  prospectId: string;
  outcome: CallOutcome;
  window: CallWindow;
  at: string;
};

export type EmailMessage = {
  id: string;
  userId: string;
  prospectId: string;
  subject: string;
  body: string;
  status: "scheduled" | "sent" | "blocked";
  scheduledFor: string;
  sentAt?: string;
  createdAt: string;
};

export type SequenceStep = {
  day: 1 | 5 | 8;
  channel: "sms" | "voicemail";
  provider: "Twilio" | "DropCowboy";
  status: "pending" | "sent" | "skipped";
  sentAt?: string;
  preview?: string;
};

export type SequenceEnrollment = {
  id: string;
  userId: string;
  prospectId: string;
  startedAt: string;
  status: "active" | "halted" | "completed";
  haltReason?: "reply" | "stop" | "booked";
  steps: SequenceStep[];
};

export type AuditCall = {
  time: string;
  caller: string;
  answered: boolean;
  note: string;
};

export type Audit = {
  id: string;
  userId: string;
  businessName: string;
  city: string;
  trade: Trade;
  monthlyInbound: number;
  unansweredShare: number;
  avgTicket: number;
  calls: AuditCall[];
  createdAt: string;
};

export type Activity = {
  id: string;
  userId: string;
  at: string;
  actor: string;
  dept: string;
  module: string;
  summary: string;
  source: string;
  status: string;
};

export type Settings = {
  userId: string;
  senderName: string;
  senderCompany: string;
  senderPhone: string;
  senderEmail: string;
  signature: string;
  weeklyEmailCap: number;
  timezone: string;
};

export type EmailTemplate = {
  userId: string;
  subject: string;
  body: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  company: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  company: string;
};

export type Database = {
  users: User[];
  prospects: Prospect[];
  calls: CallLog[];
  emails: EmailMessage[];
  sequences: SequenceEnrollment[];
  audits: Audit[];
  activity: Activity[];
  settings: Settings[];
  templates: EmailTemplate[];
};

export type Stats = {
  prospects: number;
  qualified: number;
  discarded: number;
  suppressed: number;
  emailsThisWeek: number;
  emailCap: number;
  openSequences: number;
  replies: number;
  booked: number;
  replyRate: number;
  trialRate: number;
};

export type Integrations = {
  gmail: boolean;
  twilio: boolean;
  dropcowboy: boolean;
  outscraper: boolean;
  delivery: "simulation";
};

export type Bootstrap = {
  user: PublicUser;
  prospects: Prospect[];
  calls: CallLog[];
  emails: EmailMessage[];
  sequences: SequenceEnrollment[];
  audits: Audit[];
  activity: Activity[];
  settings: Settings;
  template: EmailTemplate;
  stats: Stats;
  integrations: Integrations;
};
