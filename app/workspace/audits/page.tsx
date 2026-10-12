"use client";

import { useState } from "react";
import { Banner, Field, inputClass, useWorkspace } from "@/components/workspace/use-workspace";
import { TRADES } from "@/lib/demo";
import { auditMath, money } from "@/lib/merge";
import type { AuditCall, Trade } from "@/lib/types";

const starter: AuditCall[] = [
  { time: "7:41 AM", caller: "", answered: false, note: "" },
  { time: "7:55 AM", caller: "", answered: false, note: "" },
  { time: "12:08 PM", caller: "", answered: false, note: "" },
  { time: "12:22 PM", caller: "", answered: true, note: "" },
  { time: "5:20 PM", caller: "", answered: false, note: "" },
];

export default function AuditsPage() {
  const { data, error, notice, pending, act } = useWorkspace();
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("Alpharetta");
  const [trade, setTrade] = useState<Trade>("HVAC");
  const [monthlyInbound, setMonthlyInbound] = useState(80);
  const [unansweredShare, setUnansweredShare] = useState(35);
  const [avgTicket, setAvgTicket] = useState(450);
  const [calls, setCalls] = useState<AuditCall[]>(starter);
  const math = auditMath({ monthlyInbound, unansweredShare, avgTicket });

  if (!data) return <p className="text-sm text-[#5c5670]">Opening audits…</p>;

  function updateCall(index: number, patch: Partial<AuditCall>) {
    setCalls((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">AUDITS</p>
      <h1 className="mt-1 font-serif text-4xl text-[#241a40]">One page they can hold.</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5c5670]">
        Five calls, your volume, and the ticket size. The PDF is the leave-behind for a warm conversation.
      </p>
      <div className="mt-4">
        <Banner error={error} notice={notice} />
      </div>
      <form
        className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"
        onSubmit={(event) => {
          event.preventDefault();
          void act({
            type: "saveAudit",
            businessName,
            city,
            trade,
            monthlyInbound,
            unansweredShare,
            avgTicket,
            calls,
          }).catch(() => undefined);
        }}
      >
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Business">
              <input className={inputClass} value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
            </Field>
            <Field label="City">
              <input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} required />
            </Field>
            <Field label="Trade">
              <select className={inputClass} value={trade} onChange={(event) => setTrade(event.target.value as Trade)}>
                {TRADES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] tracking-[0.12em] text-[#8a849c]">
                <tr>
                  {["Time", "Caller", "Answered", "Note"].map((heading) => (
                    <th key={heading} className="pb-2 pr-2 font-semibold">
                      {heading.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map((call, index) => (
                  <tr key={index}>
                    <td className="py-1 pr-2">
                      <input className={inputClass} value={call.time} onChange={(event) => updateCall(index, { time: event.target.value })} />
                    </td>
                    <td className="py-1 pr-2">
                      <input className={inputClass} value={call.caller} onChange={(event) => updateCall(index, { caller: event.target.value })} />
                    </td>
                    <td className="py-1 pr-2 text-center">
                      <input type="checkbox" checked={call.answered} onChange={(event) => updateCall(index, { answered: event.target.checked })} />
                    </td>
                    <td className="py-1">
                      <input className={inputClass} value={call.note} onChange={(event) => updateCall(index, { note: event.target.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="pill pill-primary" type="submit" disabled={pending}>
            Save audit
          </button>
        </div>
        <aside className="h-fit rounded-2xl bg-[#2d6cb5] p-5 text-white">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-white/70">REVENUE ON THE TABLE</p>
          <label className="mt-4 block text-sm">
            Monthly inbound
            <input className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-[#1b1430]" type="number" min={0} value={monthlyInbound} onChange={(event) => setMonthlyInbound(Number(event.target.value))} />
          </label>
          <label className="mt-3 block text-sm">
            Unanswered share %
            <input className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-[#1b1430]" type="number" min={0} max={100} value={unansweredShare} onChange={(event) => setUnansweredShare(Number(event.target.value))} />
          </label>
          <label className="mt-3 block text-sm">
            Average ticket
            <input className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-[#1b1430]" type="number" min={0} value={avgTicket} onChange={(event) => setAvgTicket(Number(event.target.value))} />
          </label>
          <p className="mt-5 text-sm text-white/80">{math.missed.toFixed(1)} missed calls a month</p>
          <p className="mt-1 text-3xl font-semibold">{money(math.lost)}</p>
        </aside>
      </form>
      <h2 className="mt-8 font-semibold">Saved audits</h2>
      <ul className="mt-3 divide-y divide-[#f4efe6]">
        {data.audits.map((audit) => {
          const result = auditMath(audit);
          return (
            <li key={audit.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="font-medium">{audit.businessName}</span>
                <span className="mt-1 block text-[#5c5670]">
                  {audit.city} · {money(result.lost)} / month
                </span>
              </span>
              <a className="font-medium text-[#2d6cb5]" href={`/api/audits/${audit.id}/pdf`}>
                Download PDF
              </a>
            </li>
          );
        })}
        {!data.audits.length && <li className="py-3 text-sm text-[#8a849c]">No audits yet.</li>}
      </ul>
    </div>
  );
}
