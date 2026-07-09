"use client";

import { useDemo } from "@/lib/store";
import { companyJobMeta } from "@/lib/company-match";
import { CompaniesTable } from "@/components/companies-table";

export default function CompaniesPage() {
  const { companies, jobs } = useDemo();
  const meta = companyJobMeta(companies, jobs);

  return (
    <div className="rise">
      <div className="mb-5">
        <div className="eyebrow">watchlist</div>
        <h1 className="display mt-1 text-2xl font-extrabold tracking-tight">Companies</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
          {"Career boards polled directly every 30 minutes. "}
          <b>Jobs</b>
          {" counts what's left for you to act on (fit ≥ 70, not yet applied or dismissed); "}
          <b>Newest job</b>
          {" shows how fresh each company's best opening is. Companies with nothing relevant right now collapse below, still watched, back the moment something opens."}
        </p>
      </div>

      <CompaniesTable companies={companies} meta={meta} />
    </div>
  );
}
