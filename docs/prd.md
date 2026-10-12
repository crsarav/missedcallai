# Product Requirements Document (PRD): MissedCallAI

## 1. Executive Summary & Objective
MissedCallAI is an automated multi-channel outreach and missed-call recovery SaaS built specifically for home service businesses (HVAC, plumbing, roofing, electrical). The platform automates list building, pre-call verification protocols, direct Gmail integration for cold outreach, and synchronized SMS/voicemail follow-ups to convert missed inbound calls into booked appointments.

## 2. Target Users & Personas
- **Primary Persona:** Trade Business Owners / Founders (HVAC, plumbing, roofing shops in targeted metro areas like Alpharetta, GA).
- **Secondary Persona:** Agency Operators managing multi-client local lead-generation campaigns.

---

## 3. Core Modules & Architecture

### Module 1: List Building & Enrichment Engine
- **Objective:** Scrape and qualify local trade businesses from Google Maps.
- **Requirements:**
  - Integrate with scraping APIs (e.g., Outscraper, PhantomBuster) targeting queries like `"HVAC [city]"` and `"plumber [city]"`.
  - Apply automated **Qualifying Filters**: 4.0+ stars, 15–300 reviews, independent (non-franchise), no "24/7 live answering" claims.
  - Enrich records with Owner Name, direct phone lines, and verified email addresses.

### Module 2: Pre-Call Protocol & Call Logger
- **Objective:** Enforce the required pre-call protocol and log call outcomes.
- **Requirements:**
  - Schedule/prompt 3 calls per prospect on a single weekday across optimal windows: 7:30–8:00 AM, 12:00–12:30 PM, and 5:15–6:00 PM.
  - Provide a one-tap logging interface: `Answered`, `Voicemail`, `Rang out`, `Full mailbox`.
  - Automatically tag prospects as `Qualified` upon logging a voicemail or carrier greeting. Discard prospects with 3 answered calls.

### Module 3: Direct Gmail Integration (Cold Email Engine)
- **Objective:** Send personalized cold emails directly from the user's verified professional Google Workspace account (`cr@chidigital.com`).
- **Requirements:**
  - **SMTP/Gmail OAuth 2.0 Integration:** Connect user's Google account securely to send up to 100 emails/week safely within Google's rate limits.
  - **Scheduling Window:** Mon–Thursday sends between 6:45–7:30 AM prospect time.
  - **Dynamic Merge Tokens:** Populate fields like `{{first_name}}`, `{{company}}`, `{{day}}`, `{{time}}`, `{{job}}`, and `{{trade}}`.
  - **Signature Integration:** Attach custom sender sign-offs (e.g., Pradeepa Saravanan, Chi Digital LLC, 678.894.9999).

### Module 4: SMS, Voicemail Drop, & Kill Switch Engine
- **Objective:** Execute multi-channel follow-ups interleaved with email.
- **Requirements:**
  - **SMS & Ringless Voicemail:** Integrate with Twilio and DropCowboy APIs for Day 1, Day 5, and Day 8 touchpoints.
  - **Inbound Kill Switch:** Automatically halt sequences and suppress contacts upon any reply or "STOP" keyword.

### Module 5: Missed-Call Audit PDF Generator
- **Objective:** Generate one-pager audit reports for warm outreach.
- **Requirements:**
  - Dynamic input form for 5-call audit tables and custom revenue loss assumptions (inbound volume, unanswered share, average ticket size).
  - One-click export to clean, branded PDF reports.

---

## 4. Tech Stack Recommendations
- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui.
- **Backend:** Node.js (Express) or Python (FastAPI).
- **Database & Auth:** PostgreSQL (Supabase) with Row Level Security (RSL).
- **Integrations:** Gmail API / Nodemailer (SMTP), Twilio API (SMS/Voice), DropCowboy API (Voicemail Drops).

---

## 5. Success Metrics
- **Email 1 Reply Rate:** Target 6–10%.
- **Trial-Live Conversion Rate:** Target 30% of replies converted to active trials.