export const DEMO_EMAIL = "cr@chidigital.com";
export const DEMO_PASSWORD = "demo-workspace";
export const DEMO_NAME = "Pradeepa Saravanan";
export const DEMO_COMPANY = "Chi Digital LLC";
export const DEMO_PHONE = "678.894.9999";

export const TRADES = ["HVAC", "Plumbing", "Roofing", "Electrical"] as const;

export const DEFAULT_SUBJECT = "{{first_name}}, I called {{company}} {{day}}";

export const DEFAULT_BODY = `Hi {{first_name}},

I called {{company}} {{day}} around {{time}}. It rang through while the crew was likely tied up on a {{job}}.

Shops like yours lose that work when nobody gets back to the caller the same day. I can show you a short recovery sequence that still sends from your own inbox, and stops the moment someone replies.

Open to a 12-minute look this week?

{{signature}}`;

export const MODULES = [
  {
    href: "/workspace/lists",
    name: "Lists",
    color: "#0f7a4b",
    short: "Map lists with the qualifying filters.",
    blurb:
      "Build a local book from map results. Keep shops at 4.0+ stars, 15–300 reviews, independent, with no 24/7 live answering claim.",
  },
  {
    href: "/workspace/calls",
    name: "Calls",
    color: "#6a3de8",
    short: "Three windows. One tap to log the outcome.",
    blurb:
      "Three prompts on one weekday: 7:30 AM, noon, and 5:15 PM. One tap for answered, voicemail, rang out, or a full mailbox.",
  },
  {
    href: "/workspace/email",
    name: "Email",
    color: "#0f8f86",
    short: "Morning sends from your own Workspace.",
    blurb:
      "Cold email from your Google Workspace on Monday–Thursday mornings. Merge fields fill from the shop, capped at 100 sends a week.",
  },
  {
    href: "/workspace/sequences",
    name: "Follow-up",
    color: "#e07a28",
    short: "Day 1, day 5, and day 8. Stop on reply.",
    blurb:
      "Day 1 text, day 5 ringless voicemail, day 8 text. A reply or STOP halts the rest of the sequence.",
  },
  {
    href: "/workspace/audits",
    name: "Audits",
    color: "#2d6cb5",
    short: "Five calls in. A one-page PDF out.",
    blurb:
      "A five-call sample plus your inbound volume, unanswered share, and average ticket. Export a one-page PDF.",
  },
] as const;
