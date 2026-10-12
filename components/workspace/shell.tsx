"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MODULES } from "@/lib/demo";
import { CALL_WINDOWS } from "@/lib/time";
import type { PublicUser } from "@/lib/types";
import { Logo } from "../logo";

export function WorkspaceShell({
  user,
  children,
}: {
  user: PublicUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#f4f0e8]">
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">
        <Logo href="/workspace" />
        <Link href="/workspace" className="text-sm text-[#3c3552] hover:text-[#5424d6]">
          Overview
        </Link>
        <Link href="/" className="hidden text-sm text-[#8a849c] hover:text-[#5424d6] sm:inline">
          Site
        </Link>
        <p className="ml-auto hidden text-sm text-[#5c5670] sm:block">
          {user.name}
          <span className="text-[#b3adc2]"> · {user.company}</span>
        </p>
        <form action="/api/auth/logout" method="post">
          <button className="text-sm font-medium text-[#5424d6]" type="submit">
            Log out
          </button>
        </form>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        {MODULES.map((mod) => {
          const active = pathname === mod.href || pathname.startsWith(`${mod.href}/`);
          return (
            <Link
              key={mod.href}
              href={mod.href}
              style={{ backgroundColor: mod.color }}
              className={`min-h-28 px-5 py-4 text-white ${active ? "ring-4 ring-inset ring-white/80" : "opacity-95 hover:opacity-100"}`}
            >
              <span className="text-lg font-semibold">{mod.name}</span>
              <span className="mt-1 block text-sm leading-snug text-white/90">{mod.short}</span>
            </Link>
          );
        })}
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 py-4 lg:flex-row lg:px-5">
        <aside className="rounded-2xl bg-[#1c1430] p-4 text-white lg:w-60 lg:shrink-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/50">CALL WINDOWS</p>
          <ul className="mt-3 space-y-2 text-sm">
            {CALL_WINDOWS.map((item) => (
              <li key={item.id}>
                <p className="font-medium">{item.label}</p>
                <p className="text-white/55">{item.hint}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-white/50">EMAIL WINDOW</p>
          <p className="mt-2 text-sm">Mon–Thu, 6:45–7:30 AM prospect time</p>
          <p className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-white/50">KILL SWITCH</p>
          <p className="mt-2 text-sm text-white/80">A reply or STOP ends the sequence and suppresses the contact.</p>
          <div className="mt-6 border-t border-white/10 pt-4">
            <Link href="/workspace/settings" className="text-sm font-medium text-white/90 hover:text-white">
              Sender & integrations
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1 rounded-2xl bg-white p-4 shadow-[0_18px_50px_rgba(48,24,90,0.06)] md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
