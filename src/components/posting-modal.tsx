"use client";

// In the real console, job links open the live posting in a new tab and the
// table asks "did you apply?" when you come back. The demo keeps you here:
// links open this fictional posting view, and Apply hands back the same
// confirm flow.

import type { Job } from "@/lib/types";
import { jdFor } from "@/lib/fixtures/jd";
import Modal from "@/components/ui/modal";
import FitRing from "@/components/ui/fit-ring";

export function PostingModal({
  job,
  onClose,
  onApplied,
}: {
  job: Job;
  onClose: () => void;
  onApplied?: () => void; // present when opened via the Apply button
}) {
  return (
    <Modal open onClose={onClose} width={720}>
      <div className="flex items-center justify-between gap-3 border-b pb-3"
           style={{ borderColor: "var(--line)" }}>
        <span className="recorded-tag">
          fictional posting · careers.{job.company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example
        </span>
        <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div className="pt-5" data-tour="posting-body">
        <div className="eyebrow">{job.company} · {job.location}</div>
        <h2 className="display mt-1 text-2xl font-extrabold tracking-tight">
          {job.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs"
             style={{ color: "var(--ink-55)" }}>
          <span>source: {job.source}</span>
          {job.fit !== null && (
            <span className="flex items-center gap-1">
              fit <FitRing fit={job.fit} size={28} />
            </span>
          )}
          <span>sponsorship: {job.sponsorship || "·"}</span>
        </div>

        <pre
          className="mt-5 text-xs leading-6"
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "var(--font-plex-mono), monospace",
            color: "var(--ink-55)",
          }}
        >
          {jdFor(job)}
        </pre>

        {onApplied && (
          <div className="mt-6 flex items-center gap-3 border-t pt-5"
               style={{ borderColor: "var(--line)" }}>
            <button
              className="btn btn-primary px-5 py-2 text-xs"
              onClick={() => { onApplied(); onClose(); }}
            >
              Apply on this site
            </button>
            <span className="text-[11px]" style={{ color: "var(--ink-35)" }}>
              In the real console this opens the employer&apos;s page; JobPilot asks
              whether you applied when you come back.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
