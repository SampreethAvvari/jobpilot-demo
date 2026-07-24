"use client";

// Dashboard's "Fresh matches" rail: real JobCards reading off the shared demo
// store, so dismiss / apply / tailor / draft / ask work right from the
// homepage exactly as they do on the full Jobs registry. Filtering (passesFit
// + within 72h, top 6 by effectiveRecency) is this component's own job; the
// interaction handlers are not: those come from `useJobActions` in
// jobs-view.tsx so the dashboard and the full registry never drift apart.

import JobCard from "./job-card";
import EmptyState from "./ui/empty-state";
import { JobActionModals, useJobActions, withinRecency } from "./jobs-view";
import { useDemo } from "@/lib/store";
import { MIN_FIT, effectiveRecency, passesFit } from "@/lib/company-match";
import { RESUME_PDFS } from "@/lib/fixtures/persona";

const FRESH_HOURS = 72;
const FRESH_LIMIT = 6;

export default function FreshMatches() {
  const { jobs, now } = useDemo();
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

  const fresh = jobs
    .filter((j) => (j.status === "" || j.status === "New") && passesFit(j, MIN_FIT))
    .filter((j) => withinRecency(j, FRESH_HOURS, now))
    .sort((a, b) => effectiveRecency(b) - effectiveRecency(a))
    .slice(0, FRESH_LIMIT);

  if (fresh.length === 0) {
    return (
      <EmptyState
        title="Nothing fresh right now"
        hint="Postings above the fit floor land every 30 minutes in the real pipeline. Check back soon."
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {fresh.map((j) => (
          <JobCard
            key={j.row}
            job={j}
            mode="open"
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

      <JobActionModals {...actions} />
    </>
  );
}
