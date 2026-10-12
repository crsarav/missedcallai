"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/site-chrome";
import { inputClass } from "@/components/workspace/use-workspace";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(nextEmail: string, nextPassword: string) {
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not sign in.");
      router.push("/workspace");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-serif text-5xl text-[#5c3ee0]">Welcome back.</h1>
        <p className="mt-3 text-sm text-[#5c5670]">
          Demo workspace: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(email, password);
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Email</span>
            <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Password</span>
            <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="text-sm text-[#8d2218]">{error}</p>}
          <button className="pill pill-primary w-full" type="submit" disabled={pending}>
            Log in
          </button>
        </form>
        <button
          className="mt-3 w-full text-sm font-medium text-[#5424d6]"
          type="button"
          disabled={pending}
          onClick={() => {
            setEmail(DEMO_EMAIL);
            setPassword(DEMO_PASSWORD);
            void submit(DEMO_EMAIL, DEMO_PASSWORD);
          }}
        >
          Enter the demo workspace
        </button>
        <p className="mt-6 text-sm text-[#5c5670]">
          New here? <Link href="/signup" className="font-medium text-[#5424d6]">Create an account</Link>
        </p>
      </main>
    </>
  );
}
