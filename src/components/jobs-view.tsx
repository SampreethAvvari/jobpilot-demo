"use client";

// The jobs grid + filter/sort bar, demo edition. The filter/sort pipeline and
// the freshness-first defaults are ported from the real console's jobs-view
// (75 fit floor, 14 day posted window, posted-recency sort). Every write goes
// to the in-memory store, the pipeline buttons replay fixture artifacts, and
// the guided tour drives this view through window events, exactly as the old
// jobs-table did.

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import JobCard from "./job-card";
import EmptyState from "./ui/empty-state";
import Modal from "./ui/modal";
import Button from "./ui/button";
import { Segmented } from "./ui/filter-bar";
import { useToast } from "./ui/toast";
import { effectiveRecency, passesFit } from "@/lib/company-match";
import { companySize, SIZE_BUCKETS } from "@/lib/company-size";
import { isApplied } from "@/lib/status-sets";
import { RESUME_VARIANTS, ROLES, STATUSES } from "@/lib/types";
import type { Job } from "@/lib/types";
import { MIN_FIT } from "@/lib/company-match";
import { RESUME_PDFS } from "@/lib/fixtures/persona";
import { JOB_DRAFTS, OUTREACH_DRAFTS, type DraftEmail } from "@/lib/fixtures/outreach";
import {
  draftJob,
  tailorJob,
  todayStr,
  updateJob,
  useDemo,
} from "@/lib/store";

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

type Mode = "open" | "applied";
type SortKey = "recent" | "fit" | "found";

interface JobsViewProps {
  mode: Mode;
  defaultStatus?: string;
  /** Optional pre-scoped list (company drill-down); defaults to the store. */
  jobs?: Job[];
}

const FIT_OPTIONS = [0, 60, 70, 75, 80, 90];
const POSTED_OPTIONS: { value: number; label: string }[] = [
  { value: 24, label: "24h" },
  { value: 72, label: "3d" },
  { value: 168, label: "7d" },
  { value: 336, label: "14d" },
  { value: 0, label: "all" },
];
const SORT_OPTIONS = [
  { value: "recent", label: "recent" },
  { value: "fit", label: "best fit" },
  { value: "found", label: "newest found" },
];

/** Recency window by store time (not Date.now), so the prerender and the first
 * client paint agree before StoreReseed swaps the seed to visit time. Exported
 * so the dashboard's Fresh matches rail (fresh-matches.tsx) applies the exact
 * same 72h gate as this view's own posted-within filter. */
export function withinRecency(j: Job, hours: number, now: number): boolean {
  const ts = effectiveRecency(j);
  return ts !== 0 && now - ts <= hours * 3600_000;
}

function draftForJob(job: Job): DraftEmail | null {
  const byJob = JOB_DRAFTS[job.id];
  if (byJob) return byJob;
  const key = "co-" + job.company.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, "");
  return OUTREACH_DRAFTS[key] ?? null;
}

/**
 * The interaction handlers (dismiss / apply / tailor / draft / ask / status)
 * shared by every JobCard grid on the demo console: the full Jobs registry
 * (JobsView below) and the dashboard's Fresh matches rail (fresh-matches.tsx).
 * Pulled out into one hook so the two call sites never drift: one set of
 * store mutations, one apply/tailor/draft flow, one confirm dialog.
 */
export function useJobActions() {
  const toast = useToast();

  const [posting, setPosting] = useState<Job | null>(null);
  const [applyFlow, setApplyFlow] = useState<Job | null>(null);
  const [confirmJob, setConfirmJob] = useState<Job | null>(null);
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [draftOpen, setDraftOpen] = useState<DraftEmail | null>(null);
  const [note, setNote] = useState<"tailor" | "draft" | null>(null);
  const [tailoring, setTailoring] = useState<Set<number>>(new Set());
  const [drafting, setDrafting] = useState<Set<number>>(new Set());

  function dismiss(job: Job) {
    const prev = job.status;
    updateJob(job.row, { status: "Dismissed", notes: "dismissed: not relevant" });
    toast({
      message: `Dismissed ${job.company}. It will not come back.`,
      actionLabel: "Undo",
      onAction: () => updateJob(job.row, { status: prev, notes: "" }),
    });
  }

  function markApplied(job: Job) {
    const d = job.appliedDate || todayStr();
    updateJob(job.row, { status: "Applied", appliedDate: d });
  }

  function confirmApplied(job: Job) {
    markApplied(job);
    setConfirmJob(null);
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
      setTailoring((s) => {
        const n = new Set(s);
        n.delete(job.row);
        return n;
      });
    });
    if (!ok) {
      setTailoring((s) => {
        const n = new Set(s);
        n.delete(job.row);
        return n;
      });
      setNote("tailor");
    }
  }

  function draftOutreach(job: Job) {
    setDrafting((s) => new Set(s).add(job.row));
    const ok = draftJob(job, () => {
      setDrafting((s) => {
        const n = new Set(s);
        n.delete(job.row);
        return n;
      });
    });
    if (!ok) {
      setDrafting((s) => {
        const n = new Set(s);
        n.delete(job.row);
        return n;
      });
      setNote("draft");
    }
  }

  function openDraft(job: Job) {
    const d = draftForJob(job);
    if (d) setDraftOpen(d);
  }

  return {
    tailoring,
    drafting,
    posting,
    setPosting,
    applyFlow,
    setApplyFlow,
    confirmJob,
    setConfirmJob,
    chatJob,
    setChatJob,
    draftOpen,
    setDraftOpen,
    note,
    setNote,
    dismiss,
    confirmApplied,
    setStatusManual,
    analyze,
    draftOutreach,
    openDraft,
  };
}

export type JobActions = ReturnType<typeof useJobActions>;

/** Every modal/drawer a JobCard grid can open (posting view, apply flow +
 * confirm dialog, chat drawer, draft modal, tailor/draft explainer), in one
 * component so JobsView and the dashboard's Fresh matches rail render
 * identical flows off the same `useJobActions` state. */
export function JobActionModals(actions: JobActions) {
  const {
    posting,
    setPosting,
    applyFlow,
    setApplyFlow,
    confirmJob,
    setConfirmJob,
    confirmApplied,
    chatJob,
    setChatJob,
    draftOpen,
    setDraftOpen,
    note,
    setNote,
  } = actions;

  return (
    <>
      {/* Read-only posting view (opened from a title or an Applied row's open). */}
      {posting && <PostingModal job={posting} onClose={() => setPosting(null)} />}

      {/* Apply flow: the fictional posting, whose Apply hands back the confirm. */}
      {applyFlow && (
        <PostingModal
          job={applyFlow}
          onClose={() => setApplyFlow(null)}
          onApplied={() => setConfirmJob(applyFlow)}
        />
      )}

      <Modal open={confirmJob !== null} onClose={() => setConfirmJob(null)} width={420}>
        {confirmJob && (
          <div data-tour="confirm-dialog">
            <p className="eyebrow">confirm application</p>
            <h2
              className="mt-2 font-semibold"
              style={{ fontFamily: "var(--font-archivo)", fontSize: 20, color: "var(--ink)" }}
            >
              Did you apply to {confirmJob.company}?
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: "var(--ink-55)" }}>
              {[confirmJob.title, confirmJob.location].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                autoFocus
                onClick={() => confirmApplied(confirmJob)}
              >
                Yes, applied
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmJob(null)}>
                Not yet
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {chatJob && <AssistantDrawer key={chatJob.id} job={chatJob} onClose={() => setChatJob(null)} />}
      {draftOpen && <DraftModal draft={draftOpen} onClose={() => setDraftOpen(null)} />}
      {note && <DemoNote kind={note} onClose={() => setNote(null)} />}
    </>
  );
}

export default function JobsView({ mode, defaultStatus, jobs: jobsProp }: JobsViewProps) {
  const { jobs: storeJobs, now } = useDemo();
  const jobs = jobsProp ?? storeJobs;

  const actions = useJobActions();
  const {
    tailoring,
    drafting,
    setPosting,
    setApplyFlow,
    setChatJob,
    dismiss,
    setStatusManual,
    analyze,
    draftOutreach,
    openDraft,
  } = actions;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState(defaultStatus ?? (mode === "open" ? "New" : "all"));
  const [source, setSource] = useState("all");
  const [role, setRole] = useState("all");
  const [resume, setResume] = useState("all");
  const [size, setSize] = useState("all");
  const [minFit, setMinFit] = useState(mode === "open" ? MIN_FIT : 0);
  const [postedWithin, setPostedWithin] = useState(mode === "open" ? 336 : 0);
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  const sources = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.source))).filter(Boolean).sort(),
    [jobs],
  );

  const statusOptions =
    mode === "open" ? ["all", ...STATUSES] : ["all", ...STATUSES.filter(isApplied), "Rejected"];

  // Tour hooks: the guided tour drives the drawer and the tailor flow through
  // window events so every step is deterministic. Carried over verbatim from
  // the old jobs-table (demo:open-chat / demo:close-chat / demo:tailor).
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
      .filter((j) => (mode === "applied" ? true : passesFit(j, minFit)))
      .filter((j) => {
        if (mode === "applied" || !postedWithin) return true;
        return withinRecency(j, postedWithin, now);
      })
      .filter(
        (j) => !needle || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(needle),
      )
      .sort((a, b) => {
        if (mode === "applied") {
          return (b.appliedDate || b.dateFound).localeCompare(a.appliedDate || a.dateFound);
        }
        if (sortBy === "fit") return (b.fit ?? -1) - (a.fit ?? -1);
        if (sortBy === "found") {
          return (b.dateFound + String(b.fit ?? -1).padStart(3, "0")).localeCompare(
            a.dateFound + String(a.fit ?? -1).padStart(3, "0"),
          );
        }
        return effectiveRecency(b) - effectiveRecency(a);
      });
  }, [jobs, mode, q, status, source, role, resume, size, minFit, postedWithin, sortBy, now]);

  const selectClass = "input h-9 text-[12.5px]";

  return (
    <div className="rise flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" data-tour="filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search title, company, location"
          className="input w-56"
          aria-label="search jobs"
        />

        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="filter by status"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "status: all" : s}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          aria-label="filter by source"
        >
          <option value="all">source: all</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label="filter by role"
        >
          <option value="all">role: all</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          aria-label="filter by resume variant"
          title="best-match master resume for the job (FDE · AIE · MLE · SDE)"
        >
          <option value="all">resume: all</option>
          {RESUME_VARIANTS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          aria-label="filter by company size"
          title="company size, best effort by company name"
        >
          <option value="all">size: all</option>
          {SIZE_BUCKETS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {mode === "open" && (
          <>
            <select
              className={selectClass}
              value={minFit}
              onChange={(e) => setMinFit(Number(e.target.value))}
              aria-label="minimum fit"
            >
              {FIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "fit: any" : `fit ≥ ${n}`}
                </option>
              ))}
            </select>

            <select
              className={selectClass}
              value={postedWithin}
              onChange={(e) => setPostedWithin(Number(e.target.value))}
              aria-label="posted within"
            >
              {POSTED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  posted: {o.label}
                </option>
              ))}
            </select>

            <Segmented value={sortBy} onChange={(v) => setSortBy(v as SortKey)} options={SORT_OPTIONS} />
          </>
        )}

        <span className="eyebrow ml-auto whitespace-nowrap">{visible.length} shown</span>
      </div>

      <div data-tour="jobs-table">
        {visible.length === 0 ? (
          <EmptyState
            title={mode === "applied" ? "Nothing applied yet" : "No jobs match"}
            hint={
              mode === "applied"
                ? "Jobs you mark applied will show here."
                : "Try a wider fit floor or a longer posting window."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((j) => (
              <JobCard
                key={j.row}
                job={j}
                mode={mode}
                now={now}
                resumeLinks={RESUME_PDFS}
                busyTailor={tailoring.has(j.row)}
                busyDraft={drafting.has(j.row)}
                onDismiss={dismiss}
                onApply={setApplyFlow}
                onOpenPosting={setPosting}
                onTailor={analyze}
                onDraft={draftOutreach}
                onOpenDraft={openDraft}
                onAsk={setChatJob}
                onStatus={setStatusManual}
              />
            ))}
          </div>
        )}
      </div>

      <JobActionModals {...actions} />
    </div>
  );
}
