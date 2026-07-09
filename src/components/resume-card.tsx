"use client";

// The armory card: master resume + its judge report. The PDF renders in an
// iframe from static assets; Regenerate explains itself instead of faking a
// judge loop.

import { useState } from "react";
import { createPortal } from "react-dom";

import type { MasterReport } from "@/lib/fixtures/reports";

export type ResumeCardData = {
  variant: string;
  title: string;
  blurb: string;
  pdf: string;
};

function scoreColor(score: number) {
  return score >= 90 ? "var(--green)" : score >= 75 ? "var(--amber)" : "var(--red)";
}

export function ResumeCard({ data, report }: { data: ResumeCardData; report: MasterReport | null }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(false);
  const r = report?.report;

  return (
    <div className="panel p-5" data-tour={data.variant === "FDE" ? "resume-card" : undefined}>
      <div className="flex items-start justify-between">
        <div>
          <div className="display text-3xl font-extrabold" style={{ color: "var(--amber)" }}>
            {data.variant}
          </div>
          <div className="mt-1 font-semibold">{data.title}</div>
          <div className="mt-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
            {data.blurb}
          </div>
        </div>
        {report && (
          <button onClick={() => setOpen(true)} className="text-right"
                  title="Open PDF + full ATS report">
            <div className="display text-2xl font-extrabold"
                 style={{ color: scoreColor(report.score) }}>
              {report.score}
            </div>
            <div className="eyebrow">ats report ↗</div>
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a className="btn-amber px-3 py-1.5 text-[11px]" href={data.pdf}
           target="_blank" rel="noopener">
          ⬇ Download PDF
        </a>
        {report && (
          <button onClick={() => setOpen(true)} className="btn-ghost px-3 py-1.5 text-[11px]">
            ATS report
          </button>
        )}
        <button onClick={() => setNote(true)}
                className="btn-ghost px-3 py-1.5 text-[11px]"
                title="Up to 10 judge-guided rewrites; published only if the score improves">
          ↻ Regenerate
        </button>
      </div>

      {note && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "rgba(5,7,9,0.78)" }}
             onClick={() => setNote(false)}>
          <div onClick={(e) => e.stopPropagation()} className="rise"
               style={{ maxWidth: 440, margin: 16, padding: 24, background: "#11161c",
                        borderRadius: 12, border: "1px solid var(--line)" }}>
            <div className="eyebrow">demo note</div>
            <div className="display mt-2 text-lg font-bold">Regenerate runs the judge loop</div>
            <p className="mt-3 text-xs leading-5" style={{ color: "var(--text-dim)" }}>
              In the real console this rewrites the master up to 10 times, scoring each
              attempt with the calibrated ATS judge (impact 35, brevity 20, style 15,
              sections 15, soft skills 15), and publishes only if the score improves.
              The demo keeps its fixtures still instead of pretending to run a model.
            </p>
            <button className="btn-amber mt-5 px-4 py-2 text-xs" onClick={() => setNote(false)}>
              Got it
            </button>
          </div>
        </div>,
        document.body,
      )}

      {open && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "rgba(5,7,9,0.85)" }}
             onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}
               className="flex-col md:flex-row"
               style={{ width: "94vw", maxWidth: 1300, height: "88vh",
                        background: "#0e1318", borderRadius: 12, overflow: "hidden",
                        border: "1px solid rgba(255,176,0,0.35)", display: "flex" }}>
            <div className="h-1/2 md:h-full"
                 style={{ flex: "1 1 55%", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
              <iframe src={data.pdf}
                      title={`${data.variant} resume`}
                      style={{ width: "100%", height: "100%", border: 0,
                               background: "#fff" }} />
            </div>
            <div className="h-1/2 md:h-full"
                 style={{ flex: "1 1 45%", padding: 20, overflowY: "auto",
                          color: "var(--text)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow">ats report · {data.variant}</div>
                  <div className="display text-4xl font-extrabold"
                       style={{ color: scoreColor(report?.score ?? 0) }}>
                    {report?.score}<span className="text-base font-normal"
                                         style={{ color: "var(--text-faint)" }}>/100</span>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                        className="btn-ghost px-3 py-1 text-xs">✕ close</button>
              </div>
              {r && (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(r.breakdown).map(([k, v]) => (
                      <div key={k} className="panel px-3 py-2">
                        <div className="eyebrow">{k.replace("_", " ")}</div>
                        <div className="font-bold">{v}</div>
                      </div>
                    ))}
                    <div className="panel px-3 py-2">
                      <div className="eyebrow">keywords</div>
                      <div className="font-bold">{Math.round(r.keyword_coverage * 100)}%</div>
                    </div>
                    <div className="panel px-3 py-2">
                      <div className="eyebrow">pages / words / attempts</div>
                      <div className="font-bold">{r.pages} / {r.words} / {r.attempts}</div>
                    </div>
                  </div>
                  <div className="eyebrow mt-5 mb-2">violations</div>
                  {r.issues.length ? (
                    <ul className="list-disc space-y-1 pl-4 text-[11px]"
                        style={{ color: "var(--text-dim)" }}>
                      {r.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                  ) : (
                    <div className="text-xs" style={{ color: "var(--green)" }}>
                      Clean pass. No violations under the current rubric.
                    </div>
                  )}
                  <div className="eyebrow mt-4">scored {report?.timestamp} · rubric: impact 35
                    / brevity 20 / style 15 / sections 15 / soft-skills 15 (ResumeWorded replica)</div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
