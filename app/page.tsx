import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { MODULES } from "@/lib/demo";

const SHOPS = ["Hearthline", "Red Clay", "Lantern", "Switch & Cedar", "Pipe & Pine", "Oak & Main", "Fuse House", "Creekline"];

const PREVIEW = [
  ["Oct 10, 2:02 PM", "Pradeepa Saravanan", "HVAC", "Audits", "Audit", "Ready", "Five-call audit for Peachtree Comfort"],
  ["Oct 9, 6:51 AM", "Pradeepa Saravanan", "HVAC", "Follow-up", "Twilio", "Sent", "Day 1 SMS for Hearthline"],
  ["Oct 9, 6:46 AM", "Pradeepa Saravanan", "HVAC", "Email", "Gmail", "Sent", "Morning note to Maya Chen"],
  ["Oct 9, 5:28 PM", "Pradeepa Saravanan", "Roofing", "Calls", "Protocol", "Qualified", "Voicemail at Lantern Roofing"],
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-8 pt-14 md:pt-20">
          <Link
            href="/product"
            className="inline-flex items-center gap-3 rounded-full border border-[#e4dced] bg-white py-1 pl-1 pr-3 text-sm"
          >
            <span className="rounded-full bg-[#6a3de8] px-2 py-0.5 text-[11px] font-semibold tracking-wider text-white">NEW</span>
            Introducing the call desk
            <span aria-hidden="true">→</span>
          </Link>
          <h1 className="mt-8 max-w-4xl font-serif text-[2.7rem] leading-[1.05] text-[#5c3ee0] md:text-7xl">
            You told everyone to answer the phone.
            <span className="mt-2 block">Now give missed calls a secure place to land.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4d4663]">
            MissedCallAI lets HVAC, plumbing, roofing, and electrical teams recover the calls that rang out.
            You keep the list, the Gmail account, and the switch that stops everything when someone replies.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="pill pill-primary">
              Book a demo
            </Link>
            <Link href="/signup" className="pill pill-outline">
              Sign up free
            </Link>
          </div>
          <ul id="customers" className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 text-[#9a93aa]">
            {SHOPS.map((shop) => (
              <li key={shop} className="font-serif text-xl">
                {shop}
              </li>
            ))}
          </ul>
        </section>

        <section className="relative mx-auto mt-6 max-w-6xl px-5 pb-4">
          <p className="floral-word text-center text-[18vw] md:text-[11rem]">BOOKED</p>
          <span className="absolute left-[8%] top-[18%] -rotate-6 rounded-md bg-[#123c2e] px-2 py-1 text-[10px] font-bold tracking-wider text-[#b6f3c8]">
            3 WINDOWS
          </span>
          <span className="absolute right-[10%] top-[8%] rotate-3 rounded-md bg-[#e07a28] px-2 py-1 text-[10px] font-bold tracking-wider text-white">
            KILL SWITCH
          </span>
          <span className="absolute bottom-[38%] right-[16%] rotate-2 rounded-md bg-[#5c3ee0] px-2 py-1 text-[10px] font-bold tracking-wider text-white">
            100 / WEEK
          </span>
          <div className="relative z-10 -mt-6 overflow-hidden rounded-t-3xl border border-[#ece4d8] bg-white/80 px-5 py-4 shadow-[0_-20px_50px_rgba(80,40,140,0.05)]">
            <div className="flex items-center gap-3 text-sm text-[#5c5670]">
              <span className="h-2 w-2 rounded-full bg-[#6a3de8]" />
              Your workspace
              <span className="ml-auto">Call desk</span>
            </div>
          </div>
        </section>

        <section className="px-3 pb-16 md:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-[#6d42ea] px-6 py-12 text-white md:px-12 md:py-16">
            <div className="relative z-10 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
              <h2 className="max-w-md font-serif text-5xl leading-[1.05] md:text-6xl">
                Complete recovery.
                <span className="block">No compromises.</span>
              </h2>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold">Follow-up, controlled by you</h3>
                  <p className="mt-3 text-sm leading-6 text-white/85">
                    The desk suggests the next touch after a voicemail or a ring-out. Sequences stop the moment someone replies or texts STOP. You decide what gets recorded as sent.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">On the hours you already work</h3>
                  <p className="mt-3 text-sm leading-6 text-white/85">
                    Three call windows on a weekday. Email only Monday through Thursday, early, from the Google Workspace you already trust. One hundred sends a week.
                  </p>
                </div>
              </div>
            </div>
            <p className="relative z-10 mt-10 max-w-md text-sm leading-6 text-white/90">
              Built for shops that miss calls while the crew is on a job, and for agencies running more than one book.
            </p>
            <Link href="/product" className="pill pill-light relative z-10 mt-6">
              Explore the product
            </Link>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
              style={{ backgroundImage: "url(/floral-clear.svg)", backgroundSize: "180px 140px", backgroundRepeat: "repeat-x" }}
              aria-hidden="true"
            />
          </div>
        </section>

        <section id="solutions" className="mx-auto max-w-6xl px-5 pb-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">TEAMS USING MISSEDCALLAI</p>
          <h2 className="mt-3 max-w-xl font-serif text-5xl text-[#241a40]">Keep important jobs moving</h2>
        </section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
          {MODULES.map((mod) => (
            <Link key={mod.href} href={mod.href} style={{ backgroundColor: mod.color }} className="min-h-36 px-5 py-5 text-white">
              <span className="text-xl font-semibold">{mod.name}</span>
              <span className="mt-2 block text-sm leading-6 text-white/90">{mod.blurb}</span>
            </Link>
          ))}
        </div>
        <section className="bg-[#efeae2] px-3 py-6 md:px-8">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-[220px_1fr]">
            <aside className="bg-[#1c1430] p-5 text-white">
              <p className="text-[11px] tracking-[0.16em] text-white/50">WORKSPACE</p>
              <ul className="mt-4 space-y-2 text-sm">
                {["Overview", "Lists", "Call desk", "Email", "Follow-up", "Audits"].map((item) => (
                  <li key={item} className={item === "Overview" ? "rounded-lg bg-white/10 px-2 py-1.5" : "px-2 py-1.5 text-white/75"}>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
            <div className="p-5 md:p-6">
              <p className="text-lg font-semibold">Activity overview</p>
              <p className="text-sm text-[#8a849c]">What the desk recorded this week</p>
              <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  ["Prospects", "4"],
                  ["Qualified", "2"],
                  ["Emails", "1"],
                  ["Sequences", "1"],
                ].map(([label, value]) => (
                  <article key={label} className="rounded-xl border border-[#efe8dc] px-3 py-3">
                    <p className="text-[11px] tracking-[0.12em] text-[#8a849c] uppercase">{label}</p>
                    <p className="mt-1 text-3xl font-semibold">{value}</p>
                  </article>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-[11px] tracking-[0.12em] text-[#8a849c]">
                    <tr>
                      {["Time", "User", "Dept", "Module", "Source", "Status", "Detail"].map((heading) => (
                        <th key={heading} className="border-b border-[#efe8dc] py-2 pr-3 font-medium">
                          {heading.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PREVIEW.map((row) => (
                      <tr key={row[6]} className="border-b border-[#f6f1e8]">
                        {row.map((cell, index) => (
                          <td
                            key={`${row[0]}-${index}`}
                            className={`py-2.5 pr-3 ${index === 5 ? (cell === "Qualified" || cell === "Sent" || cell === "Ready" ? "font-medium text-[#0f7a4b]" : "") : ""}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-6xl justify-end px-2 pb-10">
            <Link href="/signup" className="pill pill-primary">
              Open the workspace
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
