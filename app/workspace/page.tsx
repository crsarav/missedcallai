"use client";

import { useMemo, useState } from "react";
import { Banner, StatusText, useWorkspace } from "@/components/workspace/use-workspace";
import { formatWhen } from "@/lib/time";

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function OverviewPage() {
  const { data, error, notice } = useWorkspace();
  const [moduleFilter, setModuleFilter] = useState("All modules");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const modules = useMemo(() => {
    const names = new Set(data?.activity.map((item) => item.module) ?? []);
    return ["All modules", ...names];
  }, [data]);
  const statuses = useMemo(() => {
    const names = new Set(data?.activity.map((item) => item.status) ?? []);
    return ["All statuses", ...names];
  }, [data]);

  if (!data) return <p className="text-sm text-[#5c5670]">Opening the workspace…</p>;

  const rows = data.activity.filter((item) => {
    if (moduleFilter !== "All modules" && item.module !== moduleFilter) return false;
    if (statusFilter !== "All statuses" && item.status !== statusFilter) return false;
    return true;
  });
  const stats = [
    ["Total prospects", String(data.stats.prospects), "In the call book"],
    ["Qualified", String(data.stats.qualified), "Voicemail or mailbox greeting"],
    ["Emails this week", `${data.stats.emailsThisWeek}/${data.stats.emailCap}`, "Rolling seven-day cap"],
    ["Open sequences", String(data.stats.openSequences), "Waiting on a later touch"],
  ];

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a849c]">OVERVIEW</p>
      <h1 className="mt-1 font-serif text-4xl text-[#241a40]">Good to see you, {data.user.name.split(" ")[0]}.</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5c5670]">
        Reply rate {pct(data.stats.replyRate)} (target 6–10%). Trial conversion {pct(data.stats.trialRate)} (target 30% of replies).
      </p>
      <Banner error={error} notice={notice} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, hint]) => (
          <article key={label} className="rounded-2xl border border-[#efe8dc] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8a849c] uppercase">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-[#8a849c]">{hint}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-[0.14em] text-[#8a849c]">ACTIVITY</h2>
        <div className="flex flex-wrap gap-2">
          <select className="rounded-lg border border-[#e4ddd2] px-2 py-1.5 text-sm" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
            {modules.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select className="rounded-lg border border-[#e4ddd2] px-2 py-1.5 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
            <button
            type="button"
            className="text-sm text-[#5424d6]"
            onClick={() => {
              setModuleFilter("All modules");
              setStatusFilter("All statuses");
            }}
          >
            Clear filters
          </button>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.12em] text-[#8a849c]">
            <tr>
              {["Time", "User", "Dept", "Module", "Source", "Status", "Detail"].map((heading) => (
                <th key={heading} className="border-b border-[#efe8dc] py-2 pr-3 font-semibold">
                  {heading.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-b border-[#f4efe6]">
                <td className="py-3 pr-3 whitespace-nowrap text-[#5c5670]">{formatWhen(item.at, data.settings.timezone)}</td>
                <td className="py-3 pr-3">{item.actor}</td>
                <td className="py-3 pr-3">{item.dept}</td>
                <td className="py-3 pr-3">{item.module}</td>
                <td className="py-3 pr-3">{item.source}</td>
                <td className="py-3 pr-3">
                  <StatusText value={item.status} />
                </td>
                <td className="py-3 pr-3 text-[#3c3552]">{item.summary}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="py-8 text-[#8a849c]">
                  Nothing matches those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
