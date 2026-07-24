"use client";

import { CompaniesView } from "@/components/companies-view";

export default function CompaniesPage() {
  return (
    <div className="rise">
      <div className="mb-5">
        <div className="eyebrow">watchlist</div>
        <h1
          className="mt-1 text-2xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Companies
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--ink-55)" }}>
          {"Career boards polled directly every 30 minutes. "}
          <b style={{ color: "var(--ink)" }}>Left to apply</b>
          {" counts what's left for you to act on (fit ≥ 75, not yet applied or dismissed); "}
          <b style={{ color: "var(--ink)" }}>Newest job</b>
          {" shows how fresh each company's best opening is. Companies with nothing relevant right now collapse below, still watched, back the moment something opens."}
        </p>
      </div>

      <CompaniesView />
    </div>
  );
}
