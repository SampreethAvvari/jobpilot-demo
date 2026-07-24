"use client";

// Company drill-down. The real console uses a dynamic route; the static demo
// reads the company from the query string instead.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useDemo, useMounted } from "@/lib/store";
import { isRemaining, jobsForCompany, norm } from "@/lib/company-match";
import JobsView from "@/components/jobs-view";
import EmptyState from "@/components/ui/empty-state";

function CompanyView() {
  const mounted = useMounted();
  const params = useSearchParams();
  const company = params.get("c") ?? "";
  const { companies, jobs } = useDemo();

  if (!mounted) return <EmptyState title="Loading" hint="Reading the watchlist." />;

  const watch = companies.find((c) => norm(c.company) === norm(company));
  const companyJobs = watch
    ? jobsForCompany(watch, jobs)
    : jobs.filter((j) => norm(j.company) === norm(company));

  return (
    <div className="rise">
      <div className="mb-4">
        <Link
          href="/companies"
          className="text-[13px] hover:underline"
          style={{ color: "var(--ink-55)" }}
        >
          ← all companies
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-archivo)", color: "var(--ink)" }}
          >
            {watch?.company ?? company ?? "Company"}
          </h1>
          {watch && (
            <span className="text-[13px]" style={{ color: "var(--ink-55)" }}>
              {watch.ats || "unresolved"}
              {watch.status && <> · {watch.status}</>}
              {watch.lastChecked && <> · checked {watch.lastChecked}</>}
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px]" style={{ color: "var(--ink-55)" }}>
          {companyJobs.filter(isRemaining).length} left to apply ·{" "}
          {companyJobs.length} tracked in total. Matching the target roles,
          scored, filtered for seniority and sponsorship, with tailoring and
          outreach per job. Switch the status filter to see handled jobs.
        </p>
      </div>

      <JobsView mode="open" defaultStatus="New" jobs={companyJobs} />
    </div>
  );
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<EmptyState title="Loading" hint="Reading the watchlist." />}>
      <CompanyView />
    </Suspense>
  );
}
