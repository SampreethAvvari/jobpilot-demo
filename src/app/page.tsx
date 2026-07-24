"use client";

// Mission control. Every number derives live from the store, so dismissing a
// job or confirming an application anywhere moves these tiles.

import Link from "next/link";
import type { ReactNode } from "react";

import { useDemo } from "@/lib/store";
import { MIN_FIT } from "@/lib/company-match";
import { APPLIED_SET } from "@/lib/status-sets";
import Card from "@/components/ui/card";
import { StatusPill } from "@/components/status";
import FreshMatches from "@/components/fresh-matches";

// Response/interview aren't shared groupings in status-sets.ts (only
// "applied or later" is), so they live here, local to the dashboard.
const RESPONDED_SET = new Set(["Response", "Interview", "Offer"]);
const FRESH_HOURS = 72;

function StatTile({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="flex min-h-[92px] flex-col justify-between px-4 py-3">
      <div className="eyebrow">{label}</div>
      <div
        className="mt-1 text-[26px] font-extrabold leading-none tracking-tight"
        style={{ fontFamily: "var(--font-archivo)", color: tone ?? "var(--ink)" }}
      >
        {value}
      </div>
    </Card>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  hrefLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2
          className="mt-1 text-lg font-bold"
          style={{ fontFamily: "var(--font-archivo)", color: "var(--ink)" }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link href={href} className="eyebrow shrink-0 hover:text-[var(--blue)]">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

/** Whole days since a "YYYY-MM-DD" stamp; Infinity when unparseable so it
 * never accidentally counts as "this week". */
function daysAgo(dateStr: string): number {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 86_400_000;
}

function RepliesCard({ children }: { children: ReactNode }) {
  return <Card className="divide-y divide-[var(--line)]">{children}</Card>;
}

export default function Dashboard() {
  const { jobs } = useDemo();

  const applied = jobs.filter((j) => APPLIED_SET.has(j.status));
  const responses = jobs.filter((j) => RESPONDED_SET.has(j.status));
  const interviews = jobs.filter((j) => j.status === "Interview" || j.status === "Offer");
  const rate = applied.length ? Math.round((responses.length / applied.length) * 100) : 0;
  const foundThisWeek = jobs.filter((j) => daysAgo(j.dateFound) <= 7).length;

  const replies = jobs
    .filter((j) => j.lastReply)
    .sort((a, b) => b.lastReply.localeCompare(a.lastReply))
    .slice(0, 5);

  return (
    <div className="rise space-y-8">
      <div>
        <div className="eyebrow">mission control</div>
        <h1
          className="mt-1 text-3xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          The hunt, <span style={{ color: "var(--blue)" }}>quantified</span>
        </h1>
      </div>

      <section>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5" data-tour="tiles">
          <StatTile label="applied" value={String(applied.length)} />
          <StatTile label="responses" value={String(responses.length)} tone="var(--amber)" />
          <StatTile label="interviews" value={String(interviews.length)} tone="var(--emerald)" />
          <StatTile label="response rate" value={`${rate}%`} tone="var(--blue)" />
          <StatTile label="found this week" value={String(foundThisWeek)} tone="var(--violet)" />
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow={`fit ${MIN_FIT}+ · last ${FRESH_HOURS} hours`}
          title="Fresh matches"
          href="/jobs"
          hrefLabel="all jobs"
        />
        <div data-tour="top-matches">
          <FreshMatches />
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="signal" title="Latest replies" />
        <RepliesCard>
          {replies.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13px]" style={{ color: "var(--ink-55)" }}>
              No replies tracked yet. They appear automatically once the scanner sees
              recruiter emails.
            </div>
          ) : (
            replies.map((j) => (
              <div key={j.row} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                    {j.company} · {j.title}
                  </div>
                  <div
                    className="mt-0.5 flex items-center gap-1.5 text-[11px]"
                    style={{ color: "var(--ink-35)" }}
                  >
                    <span className="font-mono">{j.lastReply}</span>
                    {j.replyClass && <span>· {j.replyClass}</span>}
                  </div>
                </div>
                <StatusPill status={j.status} />
              </div>
            ))
          )}
        </RepliesCard>
      </section>
    </div>
  );
}
