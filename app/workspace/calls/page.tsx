"use client";

import { useEffect, useState } from "react";
import { Banner, useWorkspace } from "@/components/workspace/use-workspace";
import { CALL_WINDOWS, activeCallWindow, formatWhen } from "@/lib/time";
import type { CallOutcome, CallWindow } from "@/lib/types";

const OUTCOMES: { id: CallOutcome; hint: string }[] = [
  { id: "Answered", hint: "Three answered calls discard the shop" },
  { id: "Voicemail", hint: "Qualifies the shop" },
  { id: "Rang out", hint: "Logged. Still unqualified" },
  { id: "Full mailbox", hint: "Carrier greeting. Qualifies the shop" },
];

export default function CallsPage() {
  const { data, error, notice, pending, act } = useWorkspace();
  const [selected, setSelected] = useState<string>("");
  const [windowId, setWindowId] = useState<CallWindow>("morning");

  useEffect(() => {
    if (!data) return;
    const active = activeCallWindow(new Date(), data.settings.timezone);
    if (active) setWindowId(active);
  }, [data]);

  if (!data) return <p className="text-sm text-[#5c5670]">Opening the call desk…</p>;

  const desk = data.prospects.filter((shop) => shop.status === "new" || shop.status === "qualified");
  const current = desk.find((shop) => shop.id === selected) ?? desk[0];
  const calls = current ? data.calls.filter((call) => call.prospectId === current.id) : [];
  const active = activeCallWindow(new Date(), data.settings.timezone);

  async function log(outcome: CallOutcome) {
    if (!current) return;
    try {
      await act({ type: "logCall", prospectId: current.id, outcome, window: windowId });
    } catch {
      /* banner */
    }
  }

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">CALL DESK</p>
      <h1 className="mt-1 font-serif text-4xl text-[#241a40]">Three calls. One weekday.</h1>
      <p className="mt-2 text-sm text-[#5c5670]">
        {active
          ? `The ${CALL_WINDOWS.find((item) => item.id === active)?.label} window is open in ${data.settings.timezone.replace("_", " ")}.`
          : "No protocol window is open right now. You can still log the call you just made."}
      </p>
      <div className="mt-4">
        <Banner error={error} notice={notice} />
      </div>
      {!desk.length && <p className="text-sm text-[#8a849c]">The call desk is clear. Add shops from Lists.</p>}
      {current && (
        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <ul className="space-y-2">
            {desk.map((shop) => (
              <li key={shop.id}>
                <button
                  type="button"
                  onClick={() => setSelected(shop.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left ${shop.id === current.id ? "border-[#6a3de8] bg-[#f6f1ff]" : "border-[#efe8dc]"}`}
                >
                  <span className="block font-medium">{shop.company}</span>
                  <span className="mt-1 block text-xs capitalize text-[#5c5670]">
                    {shop.status} · {data.calls.filter((call) => call.prospectId === shop.id).length}/3
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <section>
            <p className="text-sm text-[#5c5670]">
              {current.ownerFirst} {current.ownerLast} · {current.phone}
            </p>
            <h2 className="text-2xl font-semibold">{current.company}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {CALL_WINDOWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWindowId(item.id)}
                  className={`rounded-full px-3 py-1.5 text-sm ${windowId === item.id ? "bg-[#1c1430] text-white" : "bg-[#f7f4ef] text-[#3c3552]"}`}
                >
                  {item.label}
                  {active === item.id ? " · open" : ""}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {OUTCOMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={pending || calls.length >= 3}
                  onClick={() => void log(item.id)}
                  className="rounded-2xl border border-[#e4ddd2] px-4 py-4 text-left hover:border-[#6a3de8] disabled:opacity-50"
                >
                  <span className="block text-lg font-semibold">{item.id}</span>
                  <span className="mt-1 block text-sm text-[#5c5670]">{item.hint}</span>
                </button>
              ))}
            </div>
            <h3 className="mt-6 text-sm font-semibold tracking-[0.12em] text-[#8a849c]">LOG</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {calls.map((call) => (
                <li key={call.id} className="flex justify-between gap-3 border-b border-[#f4efe6] py-2">
                  <span>
                    {call.outcome} · {CALL_WINDOWS.find((item) => item.id === call.window)?.label}
                  </span>
                  <span className="text-[#8a849c]">{formatWhen(call.at, data.settings.timezone)}</span>
                </li>
              ))}
              {!calls.length && <li className="text-[#8a849c]">No calls yet.</li>}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
