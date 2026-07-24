"use client";

import JobsView from "@/components/jobs-view";

export default function JobsPage() {
  return (
    <div>
      <div className="mb-4">
        <div className="eyebrow">registry</div>
        <h1 className="font-display mt-1 text-2xl font-extrabold tracking-tight">All jobs</h1>
      </div>
      <JobsView mode="open" />
    </div>
  );
}
