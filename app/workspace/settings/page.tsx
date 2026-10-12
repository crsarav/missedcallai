"use client";

import { useEffect, useState } from "react";
import { Banner, Field, inputClass, useWorkspace } from "@/components/workspace/use-workspace";

const PROVIDERS = [
  { key: "gmail" as const, name: "Gmail / Google Workspace", detail: "OAuth for the morning send window. Cap stays at 100 a week." },
  { key: "twilio" as const, name: "Twilio", detail: "Day 1 and day 8 SMS." },
  { key: "dropcowboy" as const, name: "DropCowboy", detail: "Day 5 ringless voicemail." },
  { key: "outscraper" as const, name: "Outscraper", detail: "Live map pulls. The catalog in Lists stands in until a key is set." },
];

export default function SettingsPage() {
  const { data, error, notice, pending, act } = useWorkspace();
  const [form, setForm] = useState({
    senderName: "",
    senderCompany: "",
    senderPhone: "",
    senderEmail: "",
    signature: "",
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!data || ready) return;
    setForm({
      senderName: data.settings.senderName,
      senderCompany: data.settings.senderCompany,
      senderPhone: data.settings.senderPhone,
      senderEmail: data.settings.senderEmail,
      signature: data.settings.signature,
    });
    setReady(true);
  }, [data, ready]);

  if (!data) return <p className="text-sm text-[#5c5670]">Opening settings…</p>;

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">SETTINGS</p>
      <h1 className="mt-1 font-serif text-4xl text-[#241a40]">Sender and connections.</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5c5670]">
        Delivery stays in simulation even when a key is present, so seeded 555 numbers are never dialed or emailed.
      </p>
      <div className="mt-4">
        <Banner error={error} notice={notice} />
      </div>
      <form
        className="grid max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void act({ type: "saveSettings", ...form }).catch(() => undefined);
        }}
      >
        <Field label="Sender name">
          <input className={inputClass} value={form.senderName} onChange={(event) => setForm({ ...form, senderName: event.target.value })} />
        </Field>
        <Field label="Company">
          <input className={inputClass} value={form.senderCompany} onChange={(event) => setForm({ ...form, senderCompany: event.target.value })} />
        </Field>
        <Field label="Phone">
          <input className={inputClass} value={form.senderPhone} onChange={(event) => setForm({ ...form, senderPhone: event.target.value })} />
        </Field>
        <Field label="Sender email">
          <input className={inputClass} type="email" value={form.senderEmail} onChange={(event) => setForm({ ...form, senderEmail: event.target.value })} />
        </Field>
        <Field label="Signature">
          <textarea className={`${inputClass} min-h-28`} value={form.signature} onChange={(event) => setForm({ ...form, signature: event.target.value })} />
        </Field>
        <button className="pill pill-primary w-fit" type="submit" disabled={pending}>
          Save sender
        </button>
      </form>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const on = data.integrations[provider.key];
          return (
            <article key={provider.key} className="rounded-2xl border border-[#efe8dc] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{provider.name}</h2>
                <span className={`text-sm font-medium ${on ? "text-[#0f7a4b]" : "text-[#8a849c]"}`}>
                  {on ? "Key detected" : "Not set"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#5c5670]">{provider.detail}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#8a849c]">Simulation</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
