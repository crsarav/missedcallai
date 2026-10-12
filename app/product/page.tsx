import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { MODULES } from "@/lib/demo";
import { CALL_WINDOWS } from "@/lib/time";

export const metadata = { title: "Product · MissedCallAI" };

export default function ProductPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">PRODUCT</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight text-[#5c3ee0] md:text-6xl">
          The whole recovery, from the list to the leave-behind.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4d4663]">
          Five modules share one book of shops. A voicemail qualifies them. Three answered calls remove them. A reply or STOP shuts the rest of the sequence off.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {MODULES.map((mod) => (
            <article key={mod.name} className="rounded-3xl p-6 text-white" style={{ backgroundColor: mod.color }}>
              <h2 className="text-2xl font-semibold">{mod.name}</h2>
              <p className="mt-3 text-sm leading-6 text-white/90">{mod.blurb}</p>
            </article>
          ))}
        </div>
        <section className="mt-12 rounded-[28px] bg-white p-6 md:p-8">
          <h2 className="font-serif text-4xl text-[#241a40]">The weekday the protocol expects</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {CALL_WINDOWS.map((item) => (
              <li key={item.id} className="rounded-2xl bg-[#f7f4ef] p-4">
                <p className="text-lg font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-[#5c5670]">{item.hint}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-6 text-[#5c5670]">
            Email waits for Monday–Thursday, 6:45–7:30 AM in the prospect&apos;s timezone. The signature on every note is yours.
          </p>
          <Link href="/signup" className="pill pill-primary mt-6">
            Book a demo
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
