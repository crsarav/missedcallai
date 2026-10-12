# MissedCallAI

Missed-call recovery for HVAC, plumbing, roofing, and electrical teams. The workspace covers list qualification, a three-window call desk, morning email from your own sender, day 1 / 5 / 8 follow-up with a kill switch, and a one-page audit PDF.

The product requirements live in [docs/prd.md](docs/prd.md).

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo workspace:

- Email: `cr@chidigital.com`
- Password: `demo-workspace`

That account already has a small Alpharetta book, a few logged calls, one email, one sequence, and a sample audit.

## What stays on this machine

List search uses a built-in catalog of fictional shops and applies the qualifying filters (4.0+ stars, 15–300 reviews, independent, no 24/7 live answering claim). Email, SMS, and ringless voicemail are recorded in the workspace and are not sent, even if API keys are present in the environment. Seed phone numbers are 555 numbers.

Copy `.env.example` to `.env.local` if you want the Settings page to show a key as detected:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`
- `DROPCOWBOY_API_KEY`
- `OUTSCRAPER_API_KEY`
- `SESSION_SECRET`

Accounts and workspace data are stored in `data/db.json`, which is created on first launch and is not committed.
