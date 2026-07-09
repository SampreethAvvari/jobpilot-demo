"use client";

// Mission control. Every number derives live from the store, so dismissing a
// job or confirming an application anywhere moves these tiles.

import Link from "next/link";
import { useState } from "react";

import type { Job } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { FitMeter, StatusPill } from "@/components/status";
import { PostingModal } from "@/components/posting-modal";

const ADVANCED = new Set(["Applied", "Outreach sent", "Response", "Interview", "Offer"]);
const RESPONDED = new Set(["Response", "Interview", "Offer"]);

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel px-4 py-3">
      <div className="eyebrow">{label}</div>
      <div className="display mt-1 text-2xl font-extrabold"
           style={accent ? { color: "var(--amber)" } : undefined}>
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { jobs } = useDemo();
  const [posting, setPosting] = useState<Job | null>(null);

  const applied = jobs.filter((j) => ADVANCED.has(j.status));
  const responses = jobs.filter((j) => RESPONDED.has(j.status));
  const interviews = jobs.filter((j) => ["Interview", "Offer"].includes(j.status));
  const rate = applied.length ? Math.round((responses.length / applied.length) * 100) : 0;

  const top = jobs
    .filter((j) => (j.status === "New" || !j.status) && (j.fit ?? 0) >= 60)
    .sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0))
    .slice(0, 8);

  const replies = jobs
    .filter((j) => j.lastReply)
    .sort((a, b) => b.lastReply.localeCompare(a.lastReply))
    .slice(0, 5);

  return (
    <div className="rise space-y-6">
      <div>
        <div className="eyebrow">mission status</div>
        <h1 className="display mt-1 text-3xl font-extrabold tracking-tight">
          The hunt, <span style={{ color: "var(--amber)" }}>quantified.</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5" data-tour="tiles">
        <Tile label="jobs found" value={String(jobs.length)} />
        <Tile label="applied" value={String(applied.length)} accent />
        <Tile label="responses" value={String(responses.length)} />
        <Tile label="interviews" value={String(interviews.length)} />
        <Tile label="response rate" value={`${rate}%`} />
      </div>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="display text-lg font-bold">Top open matches</h2>
          <Link href="/jobs" className="eyebrow hover:text-[var(--amber)]">
            all jobs →
          </Link>
        </div>
        <div className="panel overflow-x-auto" data-tour="top-matches">
          <table className="console-table">
            <thead>
              <tr><th>Fit</th><th>Role</th><th>Company</th><th>Posted</th><th>Sponsor</th></tr>
            </thead>
            <tbody>
              {top.map((j) => (
                <tr key={j.id}>
                  <td><FitMeter fit={j.fit} /></td>
                  <td>
                    <button className="text-left font-semibold hover:underline"
                            onClick={() => setPosting(j)} title={j.why}>
                      {j.title}
                    </button>
                  </td>
                  <td>{j.company}</td>
                  <td style={{ color: "var(--text-dim)" }}>{j.postedAge === "just now" ? "just now" : j.posted.slice(0, 10)}</td>
                  <td>{j.sponsorship}</td>
                </tr>
              ))}
              {top.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center"
                        style={{ color: "var(--text-faint)" }}>
                  Nothing new above threshold. Hit Refresh jobs.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="display mb-2 text-lg font-bold">Latest replies</h2>
        <div className="panel divide-y" style={{ borderColor: "var(--line-soft)" }}>
          {replies.map((j) => (
            <div key={j.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{j.company} · {j.title}</div>
                <div className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                  {j.lastReply} · {j.replyClass}
                </div>
              </div>
              <StatusPill status={j.status} />
            </div>
          ))}
          {replies.length === 0 && (
            <div className="px-4 py-8 text-center text-xs" style={{ color: "var(--text-faint)" }}>
              No replies tracked yet. They appear automatically once the scanner sees
              recruiter emails.
            </div>
          )}
        </div>
      </section>

      {posting && <PostingModal job={posting} onClose={() => setPosting(null)} />}
    </div>
  );
}
