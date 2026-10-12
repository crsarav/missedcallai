"use client";

import { useEffect, useState } from "react";
import { Banner, Field, inputClass, StatusText, useWorkspace } from "@/components/workspace/use-workspace";
import { mergeText, tokensFor } from "@/lib/merge";
import { formatWhen, isEmailWindow } from "@/lib/time";

export default function EmailPage() {
  const { data, error, notice, pending, act } = useWorkspace();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (!data || ready) return;
    setSubject(data.template.subject);
    setBody(data.template.body);
    setReady(true);
  }, [data, ready]);

  if (!data) return <p className="text-sm text-[#5c5670]">Opening email…</p>;

  const qualified = data.prospects.filter((shop) => shop.status === "qualified");
  const previewShop = qualified.find((shop) => picked.includes(shop.id)) ?? qualified[0];
  const tokens = previewShop ? tokensFor(previewShop, data.settings, data.calls) : null;
  const inWindow = isEmailWindow(new Date(), data.settings.timezone);
  const used = data.stats.emailsThisWeek;
  const cap = data.stats.emailCap;

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">EMAIL</p>
      <h1 className="mt-1 font-serif text-4xl text-[#241a40]">From your own inbox.</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5c5670]">
        Sends are recorded as {data.settings.senderName} at {data.settings.senderEmail}. Monday–Thursday, 6:45–7:30 AM{" "}
        {data.settings.timezone.replaceAll("_", " ")}. Cap {used}/{cap} this week.
        {inWindow ? " The window is open." : " Outside the window, mail waits for the next morning."} Nothing leaves this machine.
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f1ece4]">
        <div className="h-full rounded-full bg-[#0f8f86]" style={{ width: `${Math.min(100, (used / cap) * 100)}%` }} />
      </div>
      <div className="mt-4">
        <Banner error={error} notice={notice} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void act({ type: "saveTemplate", subject, body }).catch(() => undefined);
          }}
        >
          <Field label="Subject">
            <input className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value)} />
          </Field>
          <Field label="Body">
            <textarea className={`${inputClass} min-h-64`} value={body} onChange={(event) => setBody(event.target.value)} />
          </Field>
          <p className="text-xs text-[#8a849c]">
            Tokens: {"{{first_name}} {{company}} {{day}} {{time}} {{job}} {{trade}} {{city}} {{signature}}"}
          </p>
          <button className="pill pill-outline" type="submit" disabled={pending}>
            Save template
          </button>
        </form>
        <div>
          <h2 className="font-semibold">Preview</h2>
          {tokens ? (
            <article className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#f7f4ef] p-4 text-sm leading-6">
              <p className="font-semibold">{mergeText(subject, tokens)}</p>
              <p className="mt-3">{mergeText(body, tokens)}</p>
            </article>
          ) : (
            <p className="mt-3 text-sm text-[#8a849c]">Qualify a shop on the call desk to preview a merge.</p>
          )}
          <h2 className="mt-5 font-semibold">Qualified shops</h2>
          <ul className="mt-2 space-y-2">
            {qualified.map((shop) => (
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
                  {shop.company} · {shop.ownerFirst}
                </label>
              </li>
            ))}
            {!qualified.length && <li className="text-sm text-[#8a849c]">No qualified shops yet.</li>}
          </ul>
          <button
            className="pill pill-primary mt-4"
            type="button"
            disabled={pending || !picked.length}
            onClick={() => void act({ type: "queueEmails", prospectIds: picked }).catch(() => undefined)}
          >
            Queue email
          </button>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Queue</h2>
        <button
          className="text-sm font-medium text-[#5424d6]"
          type="button"
          disabled={pending}
          onClick={() => void act({ type: "releaseEmails" }).catch(() => undefined)}
        >
          Release scheduled sends
        </button>
      </div>
      <ul className="mt-3 divide-y divide-[#f4efe6] text-sm">
        {data.emails.map((email) => {
          const shop = data.prospects.find((item) => item.id === email.prospectId);
          return (
            <li key={email.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span>
                <span className="font-medium">{email.subject}</span>
                <span className="mt-1 block text-[#5c5670]">
                  {shop?.company ?? "Shop"} · {formatWhen(email.scheduledFor, data.settings.timezone)}
                </span>
              </span>
              <StatusText value={email.status === "sent" ? "Sent" : email.status === "scheduled" ? "Scheduled" : "Blocked"} />
            </li>
          );
        })}
        {!data.emails.length && <li className="py-4 text-[#8a849c]">No email queued yet.</li>}
      </ul>
    </div>
  );
}
