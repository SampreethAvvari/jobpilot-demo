"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isApplied } from "@/lib/status-sets";
import { useDemo } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Dashboard", glyph: "◈", tour: "nav-dashboard" },
  { href: "/jobs", label: "Jobs", glyph: "≣", tour: "nav-jobs" },
  { href: "/applied", label: "Applied", glyph: "✓", tour: "nav-applied" },
  { href: "/resumes", label: "Resumes", glyph: "❑", tour: "nav-resumes" },
  { href: "/replies", label: "Replies", glyph: "⮌", tour: "nav-replies" },
  { href: "/companies", label: "Companies", glyph: "▦", tour: "nav-companies" },
  { href: "/outreach", label: "Outreach", glyph: "✉", tour: "nav-outreach" },
  { href: "/assistant", label: "Assistant", glyph: "✦", tour: "nav-assistant" },
];

const DEMO_LINKS = [
  { href: "/tailor", label: "Tailor live", glyph: "⚡", tour: "nav-tailor" },
  { href: "/run-your-own", label: "Run your own", glyph: "⚙", tour: "nav-run-your-own" },
];

export function Nav() {
  const path = usePathname();
  const { jobs } = useDemo();
  const appliedCount = jobs.filter((j) => isApplied(j.status)).length;
  const active = (href: string) =>
    href === "/" ? path === "/" : path === href || path === `${href}/`;

  return (
    <nav className="flex flex-col gap-1 px-3">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} data-tour={l.tour}
              className={`navlink ${active(l.href) ? "active" : ""}`}>
          <span aria-hidden>{l.glyph}</span>
          {l.label}
          {l.href === "/applied" && (
            <span
              className="ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none"
              style={{ background: "var(--blue-soft)", color: "var(--blue)" }}
            >
              {appliedCount}
            </span>
          )}
        </Link>
      ))}
      <div className="mx-3 my-3 border-t" style={{ borderColor: "var(--line)" }} />
      <div className="eyebrow px-3 pb-1">only in the demo</div>
      {DEMO_LINKS.map((l) => (
        <Link key={l.href} href={l.href} data-tour={l.tour}
              className={`navlink ${active(l.href) ? "active" : ""}`}>
          <span aria-hidden>{l.glyph}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
