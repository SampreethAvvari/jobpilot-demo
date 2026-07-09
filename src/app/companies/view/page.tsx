"use client";

// Company drill-down. The real console uses a dynamic route; the static demo
// reads the company from the query string instead.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useDemo, useMounted } from "@/lib/store";
import { isRemaining, jobsForCompany, norm } from "@/lib/company-match";
import { JobsTable } from "@/components/jobs-table";
import { TableSkeleton } from "@/components/skeleton";

function CompanyView() {
  const mounted = useMounted();
  const params = useSearchParams();
  const company = params.get("c") ?? "";
  const { companies, jobs } = useDemo();

  if (!mounted) return <TableSkeleton rows={6} />;

  const watch = companies.find((c) => norm(c.company) === norm(company));
  const companyJobs = watch
    ? jobsForCompany(watch, jobs)
    : jobs.filter((j) => norm(j.company) === norm(company));

  return (
    <div className="rise">
      <div className="mb-4">
        <Link href="/companies" className="text-xs hover:underline"
              style={{ color: "var(--text-dim)" }}>
          ← all companies
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h1 className="display text-2xl font-extrabold tracking-tight">
            {watch?.company ?? company ?? "Company"}
          </h1>
          {watch && (
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>
              {watch.ats || "unresolved"}
              {watch.status && <> · {watch.status}</>}
              {watch.lastChecked && <> · checked {watch.lastChecked}</>}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
          {companyJobs.filter(isRemaining).length} left to apply ·{" "}
          {companyJobs.length} tracked in total. Matching the target roles,
          scored, filtered for seniority and sponsorship, with tailoring and
          outreach per job. Switch the status filter to see handled jobs.
        </p>
      </div>

      <JobsTable jobs={companyJobs} mode="open" defaultStatus="New" defaultSort="posted" />
    </div>
  );
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <CompanyView />
    </Suspense>
  );
}
