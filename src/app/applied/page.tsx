"use client";

import { useDemo } from "@/lib/store";
import { isApplied } from "@/lib/status-sets";
import { JobsTable } from "@/components/jobs-table";

export default function AppliedPage() {
  const { jobs } = useDemo();
  const count = jobs.filter((j) => isApplied(j.status)).length;
  return (
    <div>
      <div className="mb-4">
        <div className="eyebrow">in flight</div>
        <h1 className="display mt-1 text-2xl font-extrabold tracking-tight">
          Applied <span style={{ color: "var(--green)" }}>({count})</span>
        </h1>
      </div>
      <JobsTable jobs={jobs} mode="applied" />
    </div>
  );
}
