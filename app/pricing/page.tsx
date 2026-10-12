import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = { title: "Pricing · MissedCallAI" };

const PLANS = [
  {
    name: "Shop",
    who: "One trade business",
    points: [
      "One workspace and one sender",
      "List filters, call desk, and audits",
      "100 emails a week from your Google Workspace",
      "Day 1, day 5, and day 8 follow-up with a kill switch",
    ],
  },
  {
    name: "Agency",
    who: "Operators with more than one client",
    points: [
      "A workspace for each client login",
      "The same protocol, sender, and weekly cap",
      "Replies, stops, and trials counted on the overview",
      "A conversation before anything is billed",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">PRICING</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl text-[#5c3ee0] md:text-6xl">Start in the workspace. Price the rest on a demo.</h1>
        <p className="mt-5 max-w-2xl text-lg text-[#4d4663]">
          This build runs locally with a demo account. There is no checkout here. The two shapes below are who the product is for.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PLANS.map((plan) => (
            <article key={plan.name} className="rounded-[28px] bg-white p-6">
              <h2 className="font-serif text-4xl">{plan.name}</h2>
              <p className="mt-1 text-sm text-[#8a849c]">{plan.who}</p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-[#3c3552]">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link href="/signup" className="pill pill-primary mt-6">
                Book a demo
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
