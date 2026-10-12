"use client";

import { useState } from "react";
import { Banner, useWorkspace } from "@/components/workspace/use-workspace";
import { formatWhen } from "@/lib/time";

export default function SequencesPage() {
  const { data, error, notice, pending, act } = useWorkspace();
  const [picked, setPicked] = useState<string[]>([]);

  if (!data) return <p className="text-sm text-[#5c5670]">Opening follow-up…</p>;

  const eligible = data.prospects.filter((shop) => {
    if (shop.status !== "qualified") return false;
    return !data.sequences.some((item) => item.prospectId === shop.id && item.status === "active");
  });

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">FOLLOW-UP</p>
      <h1 className="mt-1 font-serif text-4xl text-[#241a40]">Day 1, day 5, day 8.</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5c5670]">
        Text, then a ringless voicemail, then a last text. Twilio and DropCowboy stay in simulation, so these touches are recorded here and never dialed.
      </p>
      <div className="mt-4">
        <Banner error={error} notice={notice} />
      </div>
      <div className="rounded-2xl bg-[#f7f4ef] p-4">
        <h2 className="font-semibold">Enroll qualified shops</h2>
        <ul className="mt-3 space-y-2">
          {eligible.map((shop) => (
            <li key={shop.id}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={picked.includes(shop.id)}
                  onChange={(event) =>
                    setPicked((current) =>
                      event.target.checked ? [...current, shop.id] : current.filter((id) => id !== shop.id),
                    )
                  }
                />
                {shop.company}
              </label>
            </li>
          ))}
          {!eligible.length && <li className="text-sm text-[#8a849c]">Every qualified shop is already in a sequence, or none are qualified yet.</li>}
        </ul>
        <button
          className="pill pill-primary mt-4"
          type="button"
          disabled={pending || !picked.length}
          onClick={() =>
            void act({ type: "enroll", prospectIds: picked })
              .then(() => setPicked([]))
              .catch(() => undefined)
          }
        >
          Enroll
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {data.sequences.map((sequence) => {
          const shop = data.prospects.find((item) => item.id === sequence.prospectId);
          return (
            <article key={sequence.id} className="rounded-2xl border border-[#efe8dc] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{shop?.company ?? "Shop"}</h2>
                  <p className="text-sm capitalize text-[#5c5670]">
                    {sequence.status}
                    {sequence.haltReason ? ` · ${sequence.haltReason}` : ""} · started {formatWhen(sequence.startedAt, data.settings.timezone)}
                  </p>
                </div>
                {sequence.status === "active" && shop && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-full bg-[#f6f1ff] px-3 py-1.5 text-sm font-medium text-[#5424d6]"
                      type="button"
                      disabled={pending}
                      onClick={() => void act({ type: "inbound", prospectId: shop.id, kind: "reply" }).catch(() => undefined)}
                    >
                      They replied
                    </button>
                    <button
                      className="rounded-full bg-[#fde8e6] px-3 py-1.5 text-sm font-medium text-[#8d2218]"
                      type="button"
                      disabled={pending}
                      onClick={() => void act({ type: "inbound", prospectId: shop.id, kind: "stop" }).catch(() => undefined)}
                    >
                      STOP
                    </button>
                  </div>
                )}
                {shop?.status === "replied" && (
                  <button
                    className="pill pill-primary"
                    type="button"
                    disabled={pending}
                    onClick={() => void act({ type: "book", prospectId: shop.id }).catch(() => undefined)}
                  >
                    Mark trial live
                  </button>
                )}
              </div>
              <ol className="mt-4 grid gap-3 md:grid-cols-3">
                {sequence.steps.map((step) => {
                  const blocked = sequence.steps.some((item) => item.day < step.day && item.status === "pending");
                  return (
                    <li key={step.day} className="rounded-xl bg-[#f7f4ef] p-3">
                      <p className="text-xs font-semibold tracking-[0.12em] text-[#8a849c]">DAY {step.day}</p>
                      <p className="mt-1 font-medium">
                        {step.channel === "sms" ? "SMS" : "Ringless voicemail"} · {step.provider}
                      </p>
                      <p className="mt-1 text-sm capitalize text-[#5c5670]">{step.status}</p>
                      {step.preview && <p className="mt-2 text-sm leading-5 text-[#3c3552]">{step.preview}</p>}
                      {sequence.status === "active" && step.status === "pending" && (
                        <button
                          className="mt-3 text-sm font-medium text-[#5424d6] disabled:text-[#c5bfd4]"
                          type="button"
                          disabled={pending || blocked}
                          onClick={() => void act({ type: "sendStep", enrollmentId: sequence.id, day: step.day }).catch(() => undefined)}
                        >
                          Record this touch
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>
    </div>
  );
}
