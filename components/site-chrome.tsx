import Link from "next/link";
import { Logo } from "./logo";

const LINKS = [
  { href: "/product", label: "Product" },
  { href: "/#solutions", label: "Solutions" },
  { href: "/#customers", label: "Customers" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#ece6dc] bg-[#f7f4ef]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3.5">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-[#3c3552] md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#5424d6]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="hidden text-sm text-[#3c3552] hover:text-[#5424d6] sm:inline">
            Log in
          </Link>
          <Link href="/signup" className="hidden text-sm text-[#3c3552] hover:text-[#5424d6] md:inline">
            Sign up
          </Link>
          <Link href="/signup" className="pill pill-primary">
            Book a demo
          </Link>
          <Link
            href="/product"
            aria-label="Explore the product"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#ddd4c8] bg-white text-[#3c3552] sm:inline-flex"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-5 pb-3 text-sm text-[#3c3552] md:hidden">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <Link href="/login">Log in</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#ece6dc] px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="flex flex-wrap gap-5 text-sm text-[#5c5670]">
          <Link href="/product">Product</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Log in</Link>
          <Link href="/workspace">Workspace</Link>
        </div>
        <p className="text-sm text-[#8a849c]">Missed-call recovery for home service teams.</p>
      </div>
    </footer>
  );
}
