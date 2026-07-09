"use client";

import { useMemo } from "react";

import { RESUME_PDFS } from "@/lib/fixtures/persona";
import { buildMasterReports } from "@/lib/fixtures/reports";
import { ResumeCard, type ResumeCardData } from "@/components/resume-card";

const CARDS: ResumeCardData[] = [
  { variant: "FDE", title: "Forward Deployed Engineer", blurb: "Customer-facing, end-to-end ownership framing.", pdf: RESUME_PDFS.FDE },
  { variant: "MLE", title: "ML Engineer", blurb: "Training, RAG, ML-infrastructure framing.", pdf: RESUME_PDFS.MLE },
  { variant: "SDE", title: "Software Engineer", blurb: "Backend / distributed-systems framing.", pdf: RESUME_PDFS.SDE },
  { variant: "AIE", title: "AI Engineer", blurb: "GenAI / LLM-platform framing.", pdf: RESUME_PDFS.AIE },
];

export default function ResumesPage() {
  const reports = useMemo(
    () => buildMasterReports(new Date().toISOString().slice(0, 10)),
    [],
  );
  return (
    <div className="rise">
      <div className="mb-5">
        <div className="eyebrow">armory</div>
        <h1 className="display mt-1 text-2xl font-extrabold tracking-tight">Resumes</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
          One-page masters scored by the calibrated ATS judge (ResumeWorded-replica
          rubric). Click a score for the full report. Regenerate runs up to 10
          judge-guided rewrites and only publishes improvements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CARDS.map((c) => (
          <ResumeCard key={c.variant} data={c} report={reports[c.variant] ?? null} />
        ))}
      </div>
    </div>
  );
}
