"use client";

// The demo's replacement for the Google Sheet: an in-memory store seeded from
// fixtures. Prerendering and hydration both seed from the build timestamp so
// the static HTML carries the full console; right after mount the store
// reseeds to visit time (ages are offsets, so nothing visibly changes).
// Mutations live only for the visit and reset on reload.

import { useSyncExternalStore, useEffect, useState } from "react";

import type { Company, Job, Outreach } from "./types";
import { buildCompanies } from "./fixtures/companies";
import { buildJobs, freshJobs, TAILORABLE, DRAFTABLE } from "./fixtures/jobs";
import { buildOutreach } from "./fixtures/outreach";

type State = {
  now: number; // the timestamp age strings are computed against
  jobs: Job[];
  companies: Company[];
  outreach: Outreach[];
  refreshRuns: number;
};

const BUILD_TS = Number(process.env.NEXT_PUBLIC_BUILD_TS ?? Date.now());

let state: State | null = null;
let serverState: State | null = null;
const listeners = new Set<() => void>();

function seed(now: number): State {
  return {
    now,
    jobs: buildJobs(now),
    companies: buildCompanies(now),
    outreach: buildOutreach(now),
    refreshRuns: 0,
  };
}

function getServer(): State {
  if (!serverState) serverState = seed(BUILD_TS);
  return serverState;
}

function get(): State {
  if (!state) state = seed(BUILD_TS);
  return state;
}

function set(patch: Partial<State>) {
  state = { ...get(), ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useDemo(): State {
  return useSyncExternalStore(subscribe, get, getServer);
}

let reseeded = false;

/** Mounted once in the layout: swaps the build-time seed for a visit-time
 * seed immediately after hydration, before any user mutation can exist. */
export function StoreReseed() {
  useEffect(() => {
    if (reseeded) return;
    reseeded = true;
    state = seed(Date.now());
    listeners.forEach((l) => l());
  }, []);
  return null;
}

/** True after hydration, for the rare view that must be client-only. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

// ── Job actions (mirror /api/jobs/update semantics) ────────────────────────

export function updateJob(row: number, patch: Partial<Job>) {
  set({ jobs: get().jobs.map((j) => (j.row === row ? { ...j, ...patch } : j)) });
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ✨ Tailor: plays the pipeline delay, then attaches the pre-built artifacts.
 * Returns false when this job has no demo artifacts (the UI explains instead). */
export function tailorJob(job: Job, onDone: () => void): boolean {
  const artifacts = TAILORABLE[job.id];
  if (!artifacts) return false;
  setTimeout(() => {
    updateJob(job.row, artifacts);
    onDone();
  }, 4200);
  return true;
}

export function canDraft(job: Job): boolean {
  return DRAFTABLE.has(job.id);
}

/** ✉ Draft: plays the outreach delay, then attaches the demo draft. */
export function draftJob(job: Job, onDone: () => void): boolean {
  if (!canDraft(job)) return false;
  const domain = job.company.toLowerCase().replace(/[^a-z0-9]+/g, "");
  setTimeout(() => {
    updateJob(job.row, {
      draft: `demo:job-draft:${job.id}`,
      contact: `careers@${domain}.example`,
    });
    onDone();
  }, 3200);
  return true;
}

/** The header Refresh button: first run lands five fresh postings. */
export function runRefresh(onDone: (added: number) => void) {
  const s = get();
  setTimeout(() => {
    if (s.refreshRuns === 0) {
      const maxRow = Math.max(...get().jobs.map((j) => j.row));
      const fresh = freshJobs(Date.now(), maxRow + 1);
      set({ jobs: [...fresh, ...get().jobs], refreshRuns: 1 });
      onDone(fresh.length);
    } else {
      set({ refreshRuns: s.refreshRuns + 1 });
      onDone(0);
    }
  }, 6000);
}

// ── Companies ──────────────────────────────────────────────────────────────

export function addCompany(company: string, careersUrl: string) {
  const s = get();
  const row = Math.max(...s.companies.map((c) => c.row)) + 1;
  set({
    companies: [
      ...s.companies,
      {
        row, company, careersUrl,
        ats: "", slug: "", status: "pending",
        lastChecked: "", jobsLastFetch: "0",
        notes: "added in this demo session; the resolver would pick it up next run",
      },
    ],
  });
}

export function removeCompany(row: number) {
  set({ companies: get().companies.filter((c) => c.row !== row) });
}

// ── Outreach ───────────────────────────────────────────────────────────────

/** The Outreach console's company search, demo-simulated. */
export function draftCompanyOutreach(company: string, variant: string, onDone: () => void) {
  setTimeout(() => {
    const s = get();
    const row = Math.max(2, ...s.outreach.map((o) => o.row)) + 1;
    const domain = company.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".example";
    const v = variant || "AIE";
    set({
      outreach: [
        {
          row,
          searchedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          company, domain,
          variant: v,
          variantReason: variant
            ? "variant pinned by you"
            : "auto-picked: strongest master for the company's likely roles",
          subject: `${company}: engineer who ships with eval coverage`,
          guessedEmails: "",
          draft: "demo:outreach:generic",
          resume: `/resumes/jane-doe-${v.toLowerCase()}.pdf`,
          coverLetter: "yes",
          status: "Drafted",
          notes: "demo draft; the real run scrapes the company site for a published careers email",
          emailsFound: `careers@${domain} (careers page)`,
        },
        ...s.outreach,
      ],
    });
    onDone();
  }, 3800);
}
