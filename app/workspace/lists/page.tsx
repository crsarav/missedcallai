"use client";

import { useState, type FormEvent } from "react";
import { Banner, Field, inputClass, useWorkspace } from "@/components/workspace/use-workspace";
import { TRADES } from "@/lib/demo";
import type { Trade } from "@/lib/types";

type Hit = {
  id: string;
  company: string;
  ownerFirst: string;
  ownerLast: string;
  trade: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  stars: number;
  reviews: number;
  inWorkspace?: boolean;
  reasons?: string[];
};

export default function ListsPage() {
  const { data, error, notice, pending, act } = useWorkspace();
  const [trade, setTrade] = useState<Trade>("HVAC");
  const [city, setCity] = useState("Alpharetta");
  const [qualified, setQualified] = useState<Hit[]>([]);
  const [rejected, setRejected] = useState<Hit[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [manual, setManual] = useState({
    company: "",
    ownerFirst: "",
    ownerLast: "",
    trade: "Plumbing" as Trade,
    city: "Alpharetta",
    phone: "",
    email: "",
    stars: "4.6",
    reviews: "40",
    franchise: false,
    claims247: false,
  });

  async function search() {
    try {
      const result = await act({ type: "search", trade, city });
      setQualified((result.qualified as Hit[]) ?? []);
      setRejected((result.rejected as Hit[]) ?? []);
      setPicked([]);
      setSearched(true);
    } catch {
      setSearched(true);
    }
  }

  async function addSelected() {
    try {
      await act({ type: "add", ids: picked });
      setQualified((rows) => rows.map((row) => (picked.includes(row.id) ? { ...row, inWorkspace: true } : row)));
      setPicked([]);
    } catch {
      /* banner */
    }
  }

  async function addManual(event: FormEvent) {
    event.preventDefault();
    try {
      await act({
        type: "createProspect",
        ...manual,
        stars: Number(manual.stars),
        reviews: Number(manual.reviews),
      });
    } catch {
      /* banner */
    }
  }

  if (!data) return <p className="text-sm text-[#5c5670]">Opening the list engine…</p>;

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">LISTS</p>
      <h1 className="mt-1 font-serif text-4xl text-[#241a40]">Build the book.</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5c5670]">
        Search the local trade catalog the way an Outscraper pull would land: trade plus city, then the qualifying filters.
        Shops under 4.0 stars, outside 15–300 reviews, franchises, and anyone claiming 24/7 live answering stay out.
      </p>
      <div className="mt-4">
        <Banner error={error} notice={notice} />
      </div>
      <form
        className="grid gap-3 rounded-2xl bg-[#f7f4ef] p-4 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <Field label="Trade">
          <select className={inputClass} value={trade} onChange={(event) => setTrade(event.target.value as Trade)}>
            {TRADES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} placeholder="Alpharetta" />
        </Field>
        <div className="flex items-end">
          <button className="pill pill-primary w-full md:w-auto" type="submit" disabled={pending}>
            Build list
          </button>
        </div>
      </form>

      {searched && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Qualified · {qualified.length}</h2>
              <button className="pill pill-outline" type="button" disabled={pending || !picked.length} onClick={() => void addSelected()}>
                Add selected
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {qualified.map((shop) => (
                <li key={shop.id} className="rounded-xl border border-[#efe8dc] px-3 py-3">
                  <label className="flex gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      disabled={shop.inWorkspace}
                      checked={picked.includes(shop.id)}
                      onChange={(event) => {
                        setPicked((current) =>
                          event.target.checked ? [...current, shop.id] : current.filter((id) => id !== shop.id),
                        );
                      }}
                    />
                    <span>
                      <span className="font-medium">{shop.company}</span>
                      <span className="mt-1 block text-sm text-[#5c5670]">
                        {shop.ownerFirst} {shop.ownerLast} · {shop.city} · {shop.stars.toFixed(1)} stars · {shop.reviews} reviews
                      </span>
                      {shop.inWorkspace && <span className="mt-1 block text-xs font-medium text-[#0f7a4b]">Already in the book</span>}
                    </span>
                  </label>
                </li>
              ))}
              {!qualified.length && <li className="text-sm text-[#8a849c]">No independent shops matched.</li>}
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">Filtered out · {rejected.length}</h2>
            <ul className="mt-3 space-y-2">
              {rejected.map((shop) => (
                <li key={shop.id} className="rounded-xl border border-[#efe8dc] px-3 py-3">
                  <p className="font-medium">{shop.company}</p>
                  <p className="mt-1 text-sm text-[#5c5670]">
                    {shop.city} · {shop.stars.toFixed(1)} stars · {shop.reviews} reviews
                  </p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {shop.reasons?.map((reason) => (
                      <span key={reason} className="rounded-full bg-[#fde8e6] px-2 py-0.5 text-xs text-[#8d2218]">
                        {reason}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
              {!rejected.length && <li className="text-sm text-[#8a849c]">Nothing was filtered.</li>}
            </ul>
          </section>
        </div>
      )}

      <h2 className="mt-8 font-semibold">In the workspace · {data.prospects.length}</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.12em] text-[#8a849c]">
            <tr>
              {["Shop", "Owner", "Trade", "City", "Rating", "Status"].map((heading) => (
                <th key={heading} className="border-b border-[#efe8dc] py-2 pr-3 font-semibold">
                  {heading.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.prospects.map((shop) => (
              <tr key={shop.id} className="border-b border-[#f4efe6]">
                <td className="py-3 pr-3 font-medium">{shop.company}</td>
                <td className="py-3 pr-3">
                  {shop.ownerFirst} {shop.ownerLast}
                </td>
                <td className="py-3 pr-3">{shop.trade}</td>
                <td className="py-3 pr-3">{shop.city}</td>
                <td className="py-3 pr-3">
                  {shop.stars.toFixed(1)} · {shop.reviews}
                </td>
                <td className="py-3 pr-3 capitalize">{shop.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-8 rounded-2xl border border-[#efe8dc] p-4">
        <summary className="cursor-pointer font-medium">Add a shop by hand</summary>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void addManual(event)}>
          <Field label="Company">
            <input className={inputClass} value={manual.company} onChange={(event) => setManual({ ...manual, company: event.target.value })} required />
          </Field>
          <Field label="Owner first name">
            <input className={inputClass} value={manual.ownerFirst} onChange={(event) => setManual({ ...manual, ownerFirst: event.target.value })} required />
          </Field>
          <Field label="Owner last name">
            <input className={inputClass} value={manual.ownerLast} onChange={(event) => setManual({ ...manual, ownerLast: event.target.value })} />
          </Field>
          <Field label="Trade">
            <select className={inputClass} value={manual.trade} onChange={(event) => setManual({ ...manual, trade: event.target.value as Trade })}>
              {TRADES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="City">
            <input className={inputClass} value={manual.city} onChange={(event) => setManual({ ...manual, city: event.target.value })} required />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={manual.phone} onChange={(event) => setManual({ ...manual, phone: event.target.value })} required />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={manual.email} onChange={(event) => setManual({ ...manual, email: event.target.value })} required />
          </Field>
          <Field label="Stars">
            <input className={inputClass} value={manual.stars} onChange={(event) => setManual({ ...manual, stars: event.target.value })} required />
          </Field>
          <Field label="Reviews">
            <input className={inputClass} value={manual.reviews} onChange={(event) => setManual({ ...manual, reviews: event.target.value })} required />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={manual.franchise} onChange={(event) => setManual({ ...manual, franchise: event.target.checked })} />
            Franchise
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={manual.claims247} onChange={(event) => setManual({ ...manual, claims247: event.target.checked })} />
            Claims 24/7 live answering
          </label>
          <div className="md:col-span-2">
            <button className="pill pill-primary" type="submit" disabled={pending}>
              Check filters and add
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
