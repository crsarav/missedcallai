import Link from "next/link";

export function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-tight">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="11" fill={light ? "#ffffff" : "#6a3de8"} />
        <ellipse cx="11" cy="6" rx="2" ry="2.8" fill={light ? "#6a3de8" : "#ffffff"} />
        <ellipse cx="11" cy="16" rx="2" ry="2.8" fill={light ? "#6a3de8" : "#ffffff"} />
        <ellipse cx="6" cy="11" rx="2.8" ry="2" fill={light ? "#6a3de8" : "#ffffff"} />
        <ellipse cx="16" cy="11" rx="2.8" ry="2" fill={light ? "#6a3de8" : "#ffffff"} />
        <circle cx="11" cy="11" r="1.8" fill="#ffd36b" />
      </svg>
      <span className={light ? "text-white" : "text-[#1b1430]"}>
        missedcall<span className={light ? "text-white/75" : "text-[#6a3de8]"}>ai</span>
      </span>
    </Link>
  );
}
