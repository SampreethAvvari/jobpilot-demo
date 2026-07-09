"use client";

// The console's job register, demo edition. Same filters, same columns, same
// flows; the sheet writes became store writes, posting links open the
// fictional posting view, and pipeline actions replay with fixture artifacts.

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";

import { companySize, SIZE_BUCKETS } from "@/lib/company-size";
import { isApplied } from "@/lib/status-sets";
import type { Job } from "@/lib/types";
import { RESUME_VARIANTS, ROLES, STATUSES } from "@/lib/types";
import { liveAge } from "@/lib/company-match";
import { RESUME_PDFS } from "@/lib/fixtures/persona";
import { JOB_DRAFTS, OUTREACH_DRAFTS, type DraftEmail } from "@/lib/fixtures/outreach";
import { draftJob, tailorJob, todayStr, updateJob, useDemo } from "@/lib/store";
import { AtsBadge } from "@/components/ats-report";
import { FitMeter } from "@/components/status";

// Interaction-only surfaces load on demand; they never gate first paint.
const AssistantDrawer = dynamic(
  () => import("@/components/assistant-drawer").then((m) => m.AssistantDrawer),
  { ssr: false },
);
const DemoNote = dynamic(
  () => import("@/components/demo-note").then((m) => m.DemoNote),
  { ssr: false },
);
const DraftModal = dynamic(
  () => import("@/components/draft-modal").then((m) => m.DraftModal),
  { ssr: false },
);
const PostingModal = dynamic(
  () => import("@/components/posting-modal").then((m) => m.PostingModal),
  { ssr: false },
);

function draftForJob(job: Job): DraftEmail | null {
  const byJob = JOB_DRAFTS[job.id];
  if (byJob) return byJob;
  const key = "co-" + job.company.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, "");
  return OUTREACH_DRAFTS[key] ?? null;
}

export function JobsTable({
  jobs,
  mode,
  defaultStatus,
  defaultSort,
}: {
  jobs: Job[];
  mode: "open" | "applied";
  defaultStatus?: string;
  defaultSort?: "found" | "posted" | "fit";
}) {
  const [status, setStatus] = useState(defaultStatus ?? (mode === "open" ? "New" : "all"));
  const [source, setSource] = useState("all");
  const [role, setRole] = useState("all");
  const [resume, setResume] = useState("all");
  const [size, setSize] = useState("all");
  const [minFit, setMinFit] = useState(mode === "open" ? 70 : 0);
  const [postedWithin, setPostedWithin] = useState(0);
  const [sortBy, setSortBy] = useState<"found" | "posted" | "fit">(defaultSort ?? "found");
  const [q, setQ] = useState("");
  const [posting, setPosting] = useState<Job | null>(null);
  const [applyFlow, setApplyFlow] = useState<Job | null>(null);
  const [confirmJob, setConfirmJob] = useState<Job | null>(null);
  const [tailoring, setTailoring] = useState<Set<number>>(new Set());
  const [drafting, setDrafting] = useState<Set<number>>(new Set());
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [draftOpen, setDraftOpen] = useState<DraftEmail | null>(null);
  const [note, setNote] = useState<"tailor" | "draft" | null>(null);
  const { now } = useDemo();

  const sources = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.source))).sort(),
    [jobs],
  );

  // Tour hooks: the guided tour drives the drawer and the tailor flow
  // through window events so every step is deterministic.
  useEffect(() => {
    const openChat = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const j = jobs.find((x) => x.id === id);
      if (j) setChatJob(j);
    };
    const closeChat = () => setChatJob(null);
    const runTailor = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const j = jobs.find((x) => x.id === id);
      if (j && !j.tailoredResume) analyze(j);
    };
    window.addEventListener("demo:open-chat", openChat);
    window.addEventListener("demo:close-chat", closeChat);
    window.addEventListener("demo:tailor", runTailor);
    return () => {
      window.removeEventListener("demo:open-chat", openChat);
      window.removeEventListener("demo:close-chat", closeChat);
      window.removeEventListener("demo:tailor", runTailor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs
      .filter((j) => (mode === "applied" ? isApplied(j.status) : true))
      .filter((j) => {
        if (status === "all") {
          return mode === "applied"
            ? true
            : !isApplied(j.status) && j.status !== "Rejected" && j.status !== "Dismissed";
        }
        return (j.status || "New") === status;
      })
      .filter((j) => source === "all" || j.source === source)
      .filter((j) => role === "all" || (j.role || j.resumeVariant) === role)
      .filter((j) => resume === "all" || j.resumeVariant === resume)
      .filter((j) => size === "all" || companySize(j.company) === size)
      .filter((j) => j.fit === null || j.fit >= minFit)
      .filter((j) => {
        if (!postedWithin) return true;
        if (!j.posted) return false;
        const ts = Date.parse(j.posted.replace(" ", "T") + "Z");
        return Number.isFinite(ts) && now - ts <= postedWithin * 3600_000;
      })
      .filter(
        (j) =>
          !needle ||
          `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(needle),
      )
      .sort((a, b) => {
        if (mode === "applied") {
          return (b.appliedDate || b.dateFound).localeCompare(a.appliedDate || a.dateFound);
        }
        if (sortBy === "posted") return (b.posted || "").localeCompare(a.posted || "");
        if (sortBy === "fit") return (b.fit ?? -1) - (a.fit ?? -1);
        return (b.dateFound + String(b.fit ?? -1).padStart(3, "0")).localeCompare(
          a.dateFound + String(a.fit ?? -1).padStart(3, "0"),
        );
      });
  }, [jobs, status, source, role, resume, size, minFit, postedWithin, sortBy, q, mode, now]);

  function markApplied(job: Job) {
    const d = job.appliedDate || todayStr();
    updateJob(job.row, { status: "Applied", appliedDate: d });
  }

  function setStatusManual(job: Job, v: string) {
    const stampDate = v === "Applied" && !job.appliedDate;
    updateJob(job.row, {
      status: v,
      appliedDate: stampDate ? todayStr() : job.appliedDate,
    });
  }

  function analyze(job: Job) {
    setTailoring((s) => new Set(s).add(job.row));
    const ok = tailorJob(job, () => {
      setTailoring((s) => { const n = new Set(s); n.delete(job.row); return n; });
    });
    if (!ok) {
      setTailoring((s) => { const n = new Set(s); n.delete(job.row); return n; });
      setNote("tailor");
    }
  }

  function draftOutreach(job: Job) {
    setDrafting((s) => new Set(s).add(job.row));
    const ok = draftJob(job, () => {
      setDrafting((s) => { const n = new Set(s); n.delete(job.row); return n; });
    });
    if (!ok) {
      setDrafting((s) => { const n = new Set(s); n.delete(job.row); return n; });
      setNote("draft");
    }
  }

  const statusOptions =
    mode === "open" ? ["all", ...STATUSES] : ["all", ...STATUSES.filter(isApplied), "Rejected"];

  return (
    <div className="rise">
      <div className="mb-4 flex flex-wrap items-center gap-2" data-tour="filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search title / company / location…"
          className="panel w-64 px-3 py-1.5 text-xs outline-none focus:border-[var(--amber)]"
        />
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Filter by status"
                value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === "all" ? "status: all" : s}</option>
          ))}
        </select>
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Filter by source"
                value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">source: all</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Filter by role category"
                value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">role: all</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Filter by resume variant"
                title="Best-match master resume for the job (FDE / AIE / MLE / SDE)"
                value={resume} onChange={(e) => setResume(e.target.value)}>
          <option value="all">resume: all</option>
          {RESUME_VARIANTS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Filter by company size"
                title="Company size (best-effort, by company name)"
                value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="all">size: all</option>
          {SIZE_BUCKETS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Minimum fit score"
                value={minFit} onChange={(e) => setMinFit(Number(e.target.value))}>
          {[0, 50, 60, 70, 80, 90].map((n) => (
            <option key={n} value={n}>fit ≥ {n}</option>
          ))}
        </select>
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Posted recency"
                value={postedWithin} onChange={(e) => setPostedWithin(Number(e.target.value))}>
          <option value={0}>posted: any</option>
          <option value={24}>posted ≤ 24h</option>
          <option value={72}>posted ≤ 3d</option>
          <option value={168}>posted ≤ 7d</option>
        </select>
        {mode === "open" && (
          <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Sort order"
                  value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <option value="found">sort: newest found</option>
            <option value="posted">sort: recently posted</option>
            <option value="fit">sort: best fit</option>
          </select>
        )}
        <span className="eyebrow ml-auto">{visible.length} shown</span>
      </div>

      <div className="panel overflow-x-auto" data-tour="jobs-table">
        <table className="console-table">
          <thead>
            <tr>
              <th>Fit</th><th>Role</th><th>Company</th><th>Location</th>
              <th>Posted</th><th>Src</th><th>Sponsor</th>
              <th>Resume</th><th>Docs</th><th>Outreach</th>{mode === "applied" && <th>Applied</th>}<th>Status</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((j) => (
              <tr key={j.id} data-tour-job={j.id}>
                <td data-tour={j.id === "mw-fde" ? "fit-cell" : undefined}>
                  <FitMeter fit={j.fit} />
                </td>
                <td className="max-w-72">
                  <button
                    onClick={() => setPosting(j)}
                    className="text-left font-semibold hover:underline"
                    title={j.why || "open the posting"}
                  >
                    {j.title}
                  </button>
                  {j.why && (
                    <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
                      {j.why}
                    </div>
                  )}
                  {j.jdKeywords && (
                    <div className="mt-0.5 max-w-72 truncate text-[10px]"
                         style={{ color: "var(--cyan)" }} title={j.jdKeywords}>
                      kw: {j.jdKeywords}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap">
                  {j.company}
                  {companySize(j.company) !== "Unknown" && (
                    <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                      {companySize(j.company).toLowerCase()}
                    </div>
                  )}
                </td>
                <td className="max-w-40 truncate" title={j.location}>{j.location}</td>
                <td className="whitespace-nowrap" style={{ color: "var(--text-dim)" }}
                    title={j.posted || "posting date unknown"}>
                  {j.posted ? liveAge(j.posted, now) : j.postedAge}
                </td>
                <td style={{ color: "var(--text-dim)" }}>{j.source}</td>
                <td>
                  <span style={{
                    color: j.sponsorship === "likely" ? "var(--green)"
                      : j.sponsorship === "unlikely" ? "var(--red)" : "var(--text-faint)",
                  }}>
                    {j.sponsorship || "·"}
                  </span>
                </td>
                <td>
                  {j.resumeVariant && RESUME_PDFS[j.resumeVariant] ? (
                    <a href={RESUME_PDFS[j.resumeVariant]} target="_blank" rel="noopener"
                       className="hover:underline" style={{ color: "var(--cyan)" }}
                       title={`Open the ${j.resumeVariant} master resume, the best match for this job`}>
                      {j.resumeVariant} ↗
                    </a>
                  ) : (j.resumeVariant || "·")}
                </td>
                <td className="whitespace-nowrap"
                    data-tour={j.id === "mw-fde" ? "docs-cell" : j.id === "eb-aie" ? "tailor-cell" : undefined}>
                  {j.tailoredResume && !j.tailoredResume.startsWith("FAILED") ? (
                    <span className="flex flex-col gap-0.5 text-[11px]">
                      <a href={j.tailoredResume} target="_blank" rel="noopener"
                         className="hover:underline" style={{ color: "var(--green)" }}
                         title={j.jdKeywords}>Resume ⬇</a>
                      {j.coverLetter && (
                        <a href={j.coverLetter} target="_blank" rel="noopener"
                           className="hover:underline" style={{ color: "var(--green)" }}>
                          Cover ⬇
                        </a>
                      )}
                      {j.resumeAts && <AtsBadge job={j} />}
                    </span>
                  ) : tailoring.has(j.row) ? (
                    <span className="blink text-[11px]" style={{ color: "var(--amber)" }}>
                      tailoring…
                    </span>
                  ) : (
                    <span className="flex flex-col gap-0.5">
                      {j.tailoredResume.startsWith("FAILED") && (
                        <span className="text-[11px]" style={{ color: "var(--red)" }}
                              title={j.tailoredResume}>
                          ✕ failed · hover for why
                        </span>
                      )}
                      <button onClick={() => analyze(j)}
                              className="btn-ghost px-2 py-1 text-[11px]"
                              title="Extract JD keywords + generate a tailored resume and cover letter (~1 min in the real console)">
                        ✨ {j.tailoredResume.startsWith("FAILED") ? "Retry" : "Tailor"}
                      </button>
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap">
                  {j.draft ? (
                    <span className="flex flex-col gap-0.5 text-[11px]">
                      <button
                        onClick={() => { const d = draftForJob(j); if (d) setDraftOpen(d); }}
                        className="text-left hover:underline" style={{ color: "var(--violet)" }}
                        title={j.contact}>
                        Draft ✉
                      </button>
                    </span>
                  ) : drafting.has(j.row) ? (
                    <span className="blink text-[11px]" style={{ color: "var(--amber)" }}>
                      drafting…
                    </span>
                  ) : (
                    <button onClick={() => draftOutreach(j)}
                            className="btn-ghost px-2 py-1 text-[11px]"
                            title="Find a published contact and draft a personalized email into Gmail drafts (~1 min in the real console)">
                      ✉ Draft
                    </button>
                  )}
                  <button onClick={() => setChatJob(j)}
                          data-tour={j.id === "mw-fde" ? "ask-btn" : undefined}
                          className="mt-0.5 block text-[11px] hover:underline"
                          style={{ color: "var(--text-faint)" }}
                          title="Chat about this job in a side panel: application answers, resume tweaks, cover letter">
                    💬 Ask
                  </button>
                </td>
                {mode === "applied" && (
                  <td className="whitespace-nowrap" style={{ color: "var(--text-dim)" }}>
                    {j.appliedDate || "·"}
                  </td>
                )}
                <td>
                  <span className="flex items-center gap-1">
                    {isApplied(j.status) && (
                      <span title={`Applied ${j.appliedDate}`}
                            style={{ color: "var(--green)", fontWeight: 700 }}>✓</span>
                    )}
                    <select
                      className="cell-select"
                      aria-label={`Status of ${j.title} at ${j.company}`}
                      value={j.status || "New"}
                      onChange={(e) => setStatusManual(j, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </span>
                  {mode === "open" && j.appliedDate && (
                    <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                      applied {j.appliedDate}
                    </div>
                  )}
                </td>
                <td>
                  {!isApplied(j.status) ? (
                    <span className="flex items-center gap-1"
                          data-tour={j.id === "mw-fde" ? "apply-cell" : undefined}>
                      <button onClick={() => setApplyFlow(j)}
                              className="btn-amber px-3 py-1 text-[11px]"
                              title="Opens the posting; JobPilot asks if you applied when you come back">
                        Apply ↗
                      </button>
                      <button
                        onClick={() => updateJob(j.row, {
                          status: "Dismissed", notes: "dismissed: not relevant",
                        })}
                        className="btn-ghost px-2 py-1 text-[11px]"
                        title="Not relevant: hide this job everywhere"
                        style={{ color: "var(--red)" }}
                      >
                        ✕
                      </button>
                    </span>
                  ) : (
                    <button onClick={() => setPosting(j)}
                            className="btn-ghost inline-block px-3 py-1 text-[11px]">
                      Open ↗
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={mode === "applied" ? 13 : 12} className="py-10 text-center"
                      style={{ color: "var(--text-faint)" }}>
                {mode === "applied"
                  ? "Nothing applied yet. Go get them."
                  : "No jobs match the filters."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {posting && (
        <PostingModal job={posting} onClose={() => setPosting(null)} />
      )}
      {applyFlow && (
        <PostingModal
          job={applyFlow}
          onClose={() => setApplyFlow(null)}
          onApplied={() => setConfirmJob(applyFlow)}
        />
      )}

      {confirmJob && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(5,7,9,0.78)",
          }}
          onClick={() => setConfirmJob(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            data-tour="confirm-dialog"
            style={{
              width: "100%", maxWidth: 420, margin: 16, padding: 24,
              background: "#11161c", borderRadius: 12,
              border: "1px solid rgba(255,176,0,0.4)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              color: "#e8e4da",
            }}
          >
            <div className="eyebrow">confirm application</div>
            <div className="display mt-2 text-lg font-bold">
              Did you apply to {confirmJob.title}?
            </div>
            <div className="mt-1 text-xs" style={{ color: "rgba(232,228,218,0.55)" }}>
              {confirmJob.company} · {confirmJob.location}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                className="btn-amber px-4 py-2 text-xs"
                onClick={() => { markApplied(confirmJob); setConfirmJob(null); }}
              >
                ✓ Yes, applied
              </button>
              <button
                className="btn-ghost px-4 py-2 text-xs"
                onClick={() => setConfirmJob(null)}
              >
                Not yet
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {chatJob && (
        <AssistantDrawer key={chatJob.id} job={chatJob} onClose={() => setChatJob(null)} />
      )}
      {draftOpen && <DraftModal draft={draftOpen} onClose={() => setDraftOpen(null)} />}
      {note && <DemoNote kind={note} onClose={() => setNote(null)} />}
    </div>
  );
}
