"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Bootstrap } from "@/lib/types";

export function useWorkspace() {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/bootstrap", { cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (!res.ok) {
      setError("The workspace could not be loaded.");
      return;
    }
    setData((await res.json()) as Bootstrap);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function act(payload: Record<string, unknown>) {
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "That did not work.");
      if (payload.type !== "search") await refresh();
      setNotice(typeof json.message === "string" ? json.message : "");
      return json;
    } catch (err) {
      const message = err instanceof Error ? err.message : "That did not work.";
      setError(message);
      setNotice("");
      throw err;
    } finally {
      setPending(false);
    }
  }

  return { data, error, notice, pending, act, refresh, setNotice };
}

export function Banner({ error, notice }: { error: string; notice: string }) {
  if (!error && !notice) return null;
  return (
    <p
      role="status"
      className={`mb-4 rounded-xl px-4 py-3 text-sm ${error ? "bg-[#fde8e6] text-[#8d2218]" : "bg-[#e7f6ee] text-[#0f7a4b]"}`}
    >
      {error || notice}
    </p>
  );
}

export function StatusText({ value }: { value: string }) {
  const color = /sent|qualified|added|ready|booked|active/i.test(value)
    ? "#0f7a4b"
    : /scheduled|logged/i.test(value)
      ? "#a15c07"
      : /discard|suppress|block|halt/i.test(value)
        ? "#b42318"
        : /replied/i.test(value)
          ? "#6a3de8"
          : "#5c5670";
  return (
    <span className="font-medium" style={{ color }}>
      {value}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-[#3c3552]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[#e4ddd2] bg-[#fffcf8] px-3 py-2.5 text-sm outline-none focus:border-[#6a3de8]";
