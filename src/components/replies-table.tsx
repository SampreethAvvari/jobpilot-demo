"use client";

// The reply feed with the same manual-correction semantics as the real
// console: rejection closes the job, next_step moves it forward, and
// "not a reply" erases the reply and walks the status back.

import { useState } from "react";

import type { Job } from "@/lib/types";
import { updateJob } from "@/lib/store";
import { StatusPill } from "@/components/status";
import { PostingModal } from "@/components/posting-modal";

const NOT_A_REPLY = "not_a_reply";
const CLASS_OPTIONS = [
  { value: "next_step", label: "next step" },
  { value: "automated_ack", label: "automated ack" },
  { value: "rejection", label: "rejection" },
  { value: NOT_A_REPLY, label: "not a reply · remove" },
];

function correction(job: Job, value: string): Partial<Job> {
  if (value === NOT_A_REPLY) {
    const patch: Partial<Job> = { replyClass: "", lastReply: "" };
    if (job.status === "Response") {
      patch.status = job.appliedDate ? "Applied" : "Outreach sent";
    }
    return patch;
  }
  const patch: Partial<Job> = { replyClass: value };
  if (value === "rejection") patch.status = "Rejected";
  if (value === "next_step" && (job.status === "Applied" || job.status === "Outreach sent")) {
    patch.status = "Response";
  }
  return patch;
}

function classColor(replyClass: string): string {
  if (replyClass === "next_step" || replyClass === "interview") return "var(--amber)";
  if (replyClass === "rejection" || replyClass === "rejected") return "var(--red)";
  return "var(--text-dim)";
}

export function RepliesTable({ jobs }: { jobs: Job[] }) {
  const [posting, setPosting] = useState<Job | null>(null);

  return (
    <div className="panel overflow-x-auto" data-tour="replies-table">
      <table className="console-table">
        <thead>
          <tr><th>Reply date</th><th>Company</th><th>Role</th><th>Class</th><th>Status</th></tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.row}>
              <td className="whitespace-nowrap">{j.lastReply}</td>
              <td>{j.company}</td>
              <td>
                <button className="text-left hover:underline" onClick={() => setPosting(j)}>
                  {j.title}
                </button>
                {j.notes && !j.notes.startsWith("dismissed") && (
                  <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                    {j.notes}
                  </div>
                )}
              </td>
              <td>
                <select
                  className="panel cell-select px-2 py-1.5 text-xs"
                  aria-label={`Reply class for ${j.company}`}
                  style={{ color: classColor(j.replyClass) }}
                  value={CLASS_OPTIONS.some((o) => o.value === j.replyClass) ? j.replyClass : ""}
                  onChange={(e) => updateJob(j.row, correction(j, e.target.value))}
                >
                  {!CLASS_OPTIONS.some((o) => o.value === j.replyClass) && (
                    <option value="">{j.replyClass || "·"}</option>
                  )}
                  {CLASS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </td>
              <td><StatusPill status={j.status} /></td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr><td colSpan={5} className="py-10 text-center"
                    style={{ color: "var(--text-faint)" }}>
              No replies yet. Once you apply to jobs and recruiters respond to
              your watched inboxes, they show up here automatically.
            </td></tr>
          )}
        </tbody>
      </table>
      {posting && <PostingModal job={posting} onClose={() => setPosting(null)} />}
    </div>
  );
}
