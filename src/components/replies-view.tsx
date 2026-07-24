"use client";

// The reply feed with the same manual-correction semantics as the real
// console: rejection closes the job, next_step moves it forward, and
// "not a reply" erases the reply and walks the status back. Visual layer
// mirrors the real console's replies-view.tsx (a light single-column card
// list); titles open the demo's fictional posting view instead of a live
// link, since there is no real posting to open here.

import { useState } from "react";

import type { Job } from "@/lib/types";
import { updateJob } from "@/lib/store";
import { StatusPill } from "@/components/status";
import EmptyState from "@/components/ui/empty-state";
import { PostingModal } from "@/components/posting-modal";

const NOT_A_REPLY = "not_a_reply";
const CLASS_OPTIONS = [
  { value: "next_step", label: "next step" },
  { value: "automated_ack", label: "automated ack" },
  { value: "rejection", label: "rejection" },
  { value: NOT_A_REPLY, label: "not a reply · remove" },
];

/** Store patch for a manual reclassification, mirroring pipeline semantics:
 * rejection closes the job, next_step moves it forward (never backward), and
 * "not a reply" erases the reply and walks Status back to where it was. */
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
  if (replyClass === "rejection" || replyClass === "rejected") return "var(--rose)";
  return "var(--ink-55)";
}

export function RepliesView({ jobs }: { jobs: Job[] }) {
  const [posting, setPosting] = useState<Job | null>(null);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3" data-tour="replies-table">
      {jobs.length === 0 ? (
        <EmptyState
          title="No replies yet"
          hint="Inbox watch checks your mail every hour."
        />
      ) : (
        jobs.map((j) => <ReplyCard key={j.row} job={j} onOpenPosting={setPosting} />)
      )}
      {posting && <PostingModal job={posting} onClose={() => setPosting(null)} />}
    </div>
  );
}

function ReplyCard({
  job,
  onOpenPosting,
}: {
  job: Job;
  onOpenPosting: (job: Job) => void;
}) {
  return (
    <article className="card card-hover rise flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-0 flex-1 basis-56">
        <p className="eyebrow truncate">{job.company}</p>
        <button
          type="button"
          onClick={() => onOpenPosting(job)}
          className="block max-w-full truncate text-left font-semibold hover:underline"
          style={{ fontFamily: "var(--font-archivo)", fontSize: 15, color: "var(--ink)" }}
          title={job.title}
        >
          {job.title}
        </button>
      </div>

      <span className="shrink-0 font-mono text-[12px]" style={{ color: "var(--ink-55)" }}>
        {job.lastReply}
      </span>

      <div className="shrink-0">
        <StatusPill status={job.status} />
      </div>

      <div className="shrink-0">
        <label className="sr-only" htmlFor={`reply-class-${job.row}`}>
          reply classification
        </label>
        <select
          id={`reply-class-${job.row}`}
          className="input btn-sm"
          style={{ color: classColor(job.replyClass) }}
          value={CLASS_OPTIONS.some((o) => o.value === job.replyClass) ? job.replyClass : ""}
          onChange={(e) => updateJob(job.row, correction(job, e.target.value))}
        >
          {!CLASS_OPTIONS.some((o) => o.value === job.replyClass) && (
            <option value="">{job.replyClass || "·"}</option>
          )}
          {CLASS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
