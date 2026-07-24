"use client";

// One job rendered as a light card, demo edition. The visual structure mirrors
// the real console's job-card.tsx; the wiring is the demo's: tailored resume
// and cover open the fixture PDFs, the draft affordance opens the in-app draft
// modal (never a mailto), apply hands back to the fictional posting flow, and
// the ✕ dismiss / status changes write to the in-memory store.

import type { ReactNode } from "react";

import FitRing from "./ui/fit-ring";
import Badge from "./ui/badge";
import { StatusPill } from "./status";
import { AtsBadge } from "./ats-report";
import { liveAge, postedTs } from "@/lib/company-match";
import { isApplied } from "@/lib/status-sets";
import { STATUSES } from "@/lib/types";
import type { Job } from "@/lib/types";

export interface JobCardProps {
  job: Job;
  mode: "open" | "applied";
  now: number;
  resumeLinks?: Record<string, string>;
  busyTailor?: boolean;
  busyDraft?: boolean;
  onDismiss?: (job: Job) => void;
  onApply?: (job: Job) => void;
  onOpenPosting?: (job: Job) => void;
  onTailor?: (job: Job) => void;
  onDraft?: (job: Job) => void;
  onOpenDraft?: (job: Job) => void;
  onAsk?: (job: Job) => void;
  onStatus?: (job: Job, status: string) => void;
}

const noop = () => {};

/** Meta line values, joined by a middot in render. Never a dash. */
function metaParts(job: Job, now: number): string[] {
  const age = postedTs(job.posted) ? liveAge(job.posted, now) : `seen ${job.dateFound}`;
  return [age, job.location, job.remote === "yes" ? "remote" : "", job.source].filter(
    (s): s is string => Boolean(s),
  );
}

function DocLink({
  href,
  color,
  title,
  children,
}: {
  href: string;
  color: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      title={title}
      className="inline-flex items-center gap-1 font-medium hover:underline"
      style={{ color }}
    >
      {children}
    </a>
  );
}

export default function JobCard({
  job,
  mode,
  now,
  resumeLinks = {},
  busyTailor = false,
  busyDraft = false,
  onDismiss = noop,
  onApply = noop,
  onOpenPosting = noop,
  onTailor = noop,
  onDraft = noop,
  onOpenDraft = noop,
  onAsk = noop,
  onStatus = noop,
}: JobCardProps) {
  const applied = isApplied(job.status);
  const ts = postedTs(job.posted);
  const fresh = ts > 0 && now - ts <= 24 * 3600_000;
  const meta = metaParts(job, now);

  const hasTailored = Boolean(job.tailoredResume) && !job.tailoredResume.startsWith("FAILED");
  const tailorFailed = job.tailoredResume.startsWith("FAILED");
  const variantLink = job.resumeVariant ? resumeLinks[job.resumeVariant] : "";

  // Tour anchors carried over from the old jobs-table, on the hero rows the
  // guided tour steps through (Marrowstone FDE and the Emberline tailor row).
  const fitTour = job.id === "mw-fde" ? "fit-cell" : undefined;
  const docsTour =
    job.id === "mw-fde" ? "docs-cell" : job.id === "eb-aie" ? "tailor-cell" : undefined;
  const applyTour = job.id === "mw-fde" ? "apply-cell" : undefined;
  const askTour = job.id === "mw-fde" ? "ask-btn" : undefined;

  // The docs strip earns its own band only when there is something in it. For
  // eb-aie the best-match variant link keeps it present so the tour's
  // tailor-cell target exists before the demo presses Tailor.
  const showDocs =
    hasTailored ||
    Boolean(job.coverLetter) ||
    Boolean(job.resumeAts) ||
    Boolean(job.draft) ||
    Boolean(job.findPeople) ||
    Boolean(variantLink) ||
    busyTailor ||
    busyDraft;

  return (
    <article
      className="card card-hover rise relative flex flex-col gap-3 p-5"
      data-tour-job={job.id}
    >
      {!applied && (
        <button
          type="button"
          aria-label="dismiss this job forever"
          onClick={() => onDismiss(job)}
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-[15px] transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: "var(--ink-35)" }}
        >
          ✕
        </button>
      )}

      <header className="flex items-start gap-3 pr-8">
        <div data-tour={fitTour}>
          <FitRing fit={job.fit} />
        </div>
        <div className="min-w-0">
          <p className="eyebrow truncate">{job.company}</p>
          <button
            type="button"
            onClick={() => onOpenPosting(job)}
            className="block max-w-full truncate text-left font-semibold hover:underline"
            style={{ fontFamily: "var(--font-archivo)", fontSize: 16, color: "var(--ink)" }}
            title={job.why || "open the posting"}
          >
            {job.title}
          </button>
          <p
            className="mt-1 flex flex-wrap items-center text-[12px]"
            style={{ color: "var(--ink-55)" }}
          >
            {meta.map((m, i) => (
              <span key={i} className="inline-flex items-center">
                {i > 0 && <span className="px-1.5" style={{ color: "var(--ink-35)" }}>·</span>}
                {m}
              </span>
            ))}
          </p>
        </div>
      </header>

      {(fresh || job.sponsorship === "unclear" || job.sponsorship === "likely") && (
        <div className="flex flex-wrap items-center gap-2">
          {fresh && <span className="pill pill-new">new</span>}
          {job.sponsorship === "likely" && <Badge tone="emerald">sponsors</Badge>}
          {job.sponsorship === "unclear" && <Badge tone="neutral">sponsorship unclear</Badge>}
        </div>
      )}

      {job.why && (
        <p
          className="line-clamp-2 text-[13px] leading-relaxed"
          style={{ color: "var(--ink-70)" }}
          title={job.why}
        >
          {job.why}
        </p>
      )}

      {showDocs && (
        <div
          data-tour={docsTour}
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl px-3 py-2 text-[12px]"
          style={{ background: "var(--surface-2)" }}
        >
          {busyTailor ? (
            <span className="blink font-medium" style={{ color: "var(--amber)" }}>
              tailoring…
            </span>
          ) : hasTailored ? (
            <>
              <DocLink href={job.tailoredResume} color="var(--emerald)" title={job.jdKeywords}>
                resume ↓
              </DocLink>
              {job.coverLetter && (
                <DocLink href={job.coverLetter} color="var(--emerald)">
                  cover ↓
                </DocLink>
              )}
              {job.resumeAts && <AtsBadge job={job} />}
            </>
          ) : null}

          {variantLink && !hasTailored && !busyTailor && (
            <DocLink
              href={variantLink}
              color="var(--blue)"
              title={`open the ${job.resumeVariant} resume, best match for this job`}
            >
              {job.resumeVariant} ↗
            </DocLink>
          )}

          {busyDraft ? (
            <span className="blink font-medium" style={{ color: "var(--amber)" }}>
              drafting…
            </span>
          ) : (
            job.draft && (
              <button
                type="button"
                onClick={() => onOpenDraft(job)}
                className="inline-flex items-center gap-1 font-medium hover:underline"
                style={{ color: "var(--violet)" }}
                title={job.contact}
              >
                draft ✉
              </button>
            )
          )}
          {job.findPeople && !busyDraft && (
            <DocLink href={job.findPeople} color="var(--ink-55)">
              find people
            </DocLink>
          )}
        </div>
      )}

      {tailorFailed && !busyTailor && (
        <p className="text-[12px]" style={{ color: "var(--rose)" }} title={job.tailoredResume}>
          tailoring failed, hover to see why
        </p>
      )}

      <div
        className="mt-auto flex flex-wrap items-center gap-2 border-t pt-3"
        style={{ borderColor: "var(--line)" }}
      >
        {applied ? (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => onOpenPosting(job)}>
            open ↗
          </button>
        ) : (
          <span data-tour={applyTour}>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => onApply(job)}>
              apply ↗
            </button>
          </span>
        )}

        {!hasTailored && !busyTailor && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => onTailor(job)}>
            {tailorFailed ? "retry tailor" : "tailor"}
          </button>
        )}
        {!job.draft && !busyDraft && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => onDraft(job)}>
            draft
          </button>
        )}
        <button
          type="button"
          data-tour={askTour}
          className="btn btn-sm btn-ghost"
          onClick={() => onAsk(job)}
        >
          ask
        </button>

        <div className="ml-auto flex items-center gap-2">
          {mode === "applied" && applied && job.appliedDate && (
            <span className="hidden text-[11px] sm:inline" style={{ color: "var(--ink-35)" }}>
              applied {job.appliedDate}
            </span>
          )}
          {(mode === "applied" || applied) && <StatusPill status={job.status} />}
          <label className="sr-only" htmlFor={`status-${job.row}`}>
            change status
          </label>
          <select
            id={`status-${job.row}`}
            className="input h-8 px-2 text-[12px]"
            value={job.status || "New"}
            onChange={(e) => onStatus(job, e.target.value)}
            title="change this job's status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
}
