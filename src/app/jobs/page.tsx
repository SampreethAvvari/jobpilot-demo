"use client";

import { useDemo } from "@/lib/store";
import { JobsTable } from "@/components/jobs-table";

export default function JobsPage() {
  const { jobs } = useDemo();
  return (
    <div>
      <div className="mb-4">
        <div className="eyebrow">registry</div>
        <h1 className="display mt-1 text-2xl font-extrabold tracking-tight">All jobs</h1>
      </div>
      <JobsTable jobs={jobs} mode="open" />
    </div>
  );
}
