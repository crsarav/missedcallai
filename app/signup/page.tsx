"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/site-chrome";
import { inputClass } from "@/components/workspace/use-workspace";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-serif text-5xl text-[#5c3ee0]">Open a workspace.</h1>
        <p className="mt-3 text-sm leading-6 text-[#5c5670]">
          A new account starts empty. The demo on the login page already has a book, a call, and an audit.
        </p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setPending(true);
            setError("");
            void fetch("/api/auth/signup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(form),
            })
              .then(async (res) => {
                const json = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(json.error || "Could not create the account.");
                router.push("/workspace");
                router.refresh();
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not create the account."))
              .finally(() => setPending(false));
          }}
        >
          {[
            ["name", "Your name", "text"],
            ["company", "Company", "text"],
            ["email", "Email", "email"],
            ["password", "Password", "password"],
          ].map(([key, label, type]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1.5 block font-medium">{label}</span>
              <input
                className={inputClass}
                type={type}
                required
                minLength={key === "password" ? 8 : undefined}
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
          {error && <p className="text-sm text-[#8d2218]">{error}</p>}
          <button className="pill pill-primary w-full" type="submit" disabled={pending}>
            Create workspace
          </button>
        </form>
        <p className="mt-6 text-sm text-[#5c5670]">
          Already have one? <Link href="/login" className="font-medium text-[#5424d6]">Log in</Link>
        </p>
      </main>
    </>
  );
}
