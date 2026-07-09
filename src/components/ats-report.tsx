"use client";

// ATS score badge: hover = compact summary card, click = pinned full
// transparency report panel. Identical rendering to the real console; the
// report comes straight from fixtures instead of the Reports sheet tab.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Job } from "@/lib/types";
import { diffWords } from "@/lib/word-diff";
import { TAILOR_REPORTS, type JudgeReport, type KeywordFate } from "@/lib/fixtures/reports";

const CATEGORY_MAX: Record<string, number> = {
  impact: 35, brevity: 20, style: 15, sections: 15, soft_skills: 15,
};

const ACTION_LABEL: Record<KeywordFate["action"], [string, string]> = {
  already_present: ["already in resume", "var(--text-dim)"],
  added: ["added", "var(--green)"],
  not_addable: ["genuinely missing", "var(--red)"],
};

function ScoreBars({ ats }: { ats: JudgeReport }) {
  if (!ats.breakdown) return null;
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(ats.breakdown).map(([k, v]) => {
        const max = CATEGORY_MAX[k] ?? 100;
        return (
          <div key={k} className="flex items-center gap-2 text-[11px]">
            <span className="w-20 shrink-0" style={{ color: "var(--text-dim)" }}>
              {k.replace("_", " ")}
            </span>
            <span className="h-1.5 w-32 overflow-hidden rounded"
                  style={{ background: "var(--panel-2)" }}>
              <span className="block h-full rounded"
                    style={{
                      width: `${(100 * v) / max}%`,
                      background: v / max >= 0.85 ? "var(--green)" : "var(--amber)",
                    }} />
            </span>
            <span style={{ color: "var(--text-faint)" }}>{v}/{max}</span>
          </div>
        );
      })}
      {ats.keyword_coverage != null && (
        <div className="text-[11px]" style={{ color: "var(--text-dim)" }}>
          JD keyword coverage {Math.round(ats.keyword_coverage * 100)}%
          {ats.attempts ? ` · best of ${ats.attempts} attempt(s)` : ""}
        </div>
      )}
    </div>
  );
}

function HighlightedDiff({ baseline, tailored }: { baseline: string; tailored: string }) {
  return (
    <p className="text-xs leading-5">
      {diffWords(baseline, tailored).map((s, i) =>
        s.added ? (
          <mark key={i} style={{
            background: "rgba(91,217,122,0.18)", color: "var(--green)",
            borderRadius: 3, padding: "0 2px",
          }}>
            {s.text}
          </mark>
        ) : (
          <span key={i} style={{ color: "var(--text-dim)" }}>{s.text}</span>
        ),
      ).reduce<React.ReactNode[]>((acc, el, i) => (i ? [...acc, " ", el] : [el]), [])}
    </p>
  );
}

export function AtsBadge({ job }: { job: Job }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [card, setCard] = useState<{ top: number; left: number } | null>(null);
  const [pinned, setPinned] = useState(false);

  const report = TAILOR_REPORTS[job.id] ?? null;

  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPinned(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned]);

  // The tour pins and unpins this report through window events.
  useEffect(() => {
    const open = (e: Event) => {
      if ((e as CustomEvent<string>).detail === job.id) { setCard(null); setPinned(true); }
    };
    const close = () => setPinned(false);
    window.addEventListener("demo:open-ats", open);
    window.addEventListener("demo:close-ats", close);
    return () => {
      window.removeEventListener("demo:open-ats", open);
      window.removeEventListener("demo:close-ats", close);
    };
  }, [job.id]);

  const ats: JudgeReport = report?.ats ?? {};
  const added = report?.keywords.filter((k) => k.action === "added") ?? [];
  const missing = report?.keywords.filter((k) => k.action === "not_addable") ?? [];

  return (
    <>
      <button
        ref={ref}
        data-tour={job.id === "mw-fde" ? "ats-badge" : undefined}
        onMouseEnter={() => {
          const r = ref.current?.getBoundingClientRect();
          if (r) setCard({ top: r.bottom + 6, left: Math.max(8, r.right - 320) });
        }}
        onMouseLeave={() => setCard(null)}
        onClick={() => { setCard(null); setPinned(true); }}
        className="hover:underline"
        title="Hover for a summary; click for the full tailoring report"
        style={{
          color: Number(job.resumeAts) >= 90 ? "var(--green)" : "var(--amber)",
          cursor: "pointer",
        }}
      >
        ATS {job.resumeAts}
      </button>

      {card && !pinned && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed", top: card.top, left: card.left, zIndex: 9998,
          width: 320, padding: 14, pointerEvents: "none",
          background: "#11161c", borderRadius: 10,
          border: "1px solid var(--line)", boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
          color: "var(--text)",
        }}>
          <div className="eyebrow">ats {job.resumeAts} · {job.company}</div>
          <div className="mt-2">
            <ScoreBars ats={ats} />
          </div>
          <div className="mt-2 text-[11px]" style={{ color: "var(--text-dim)" }}>
            {report
              ? `${added.length} keyword(s) added · ${missing.length} genuinely missing`
              : "no transparency report for this row"}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
            click to pin the full report
          </div>
        </div>,
        document.body,
      )}

      {pinned && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "rgba(5,7,9,0.78)",
          }}
          onClick={() => setPinned(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            data-tour="ats-panel"
            style={{
              width: "min(920px, 94vw)", maxHeight: "88vh", overflowY: "auto",
              margin: 16, padding: 24, background: "#11161c", borderRadius: 12,
              border: "1px solid var(--line)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              color: "var(--text)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">tailoring report · ATS {job.resumeAts}</div>
                <div className="display mt-1 text-lg font-bold">
                  {job.title}
                </div>
                <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {job.company} · {job.resumeVariant} variant
                  {report?.precision === "excerpt" && " · tailored from the stored excerpt"}
                </div>
              </div>
              <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setPinned(false)}>
                ✕
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
              {job.tailoredResume && !job.tailoredResume.startsWith("FAILED") && (
                <a href={job.tailoredResume} target="_blank" rel="noopener"
                   className="hover:underline" style={{ color: "var(--green)" }}>Resume ⬇</a>
              )}
              {job.coverLetter && (
                <a href={job.coverLetter} target="_blank" rel="noopener"
                   className="hover:underline" style={{ color: "var(--green)" }}>Cover ⬇</a>
              )}
            </div>

            {!report && (
              <p className="mt-5 text-xs" style={{ color: "var(--text-dim)" }}>
                No transparency report for this row. In the real console a Generate
                button reconstructs one from the stored PDFs in about a minute.
              </p>
            )}

            {report && (
              <>
                <div className="mt-5">
                  <div className="eyebrow">pulled from the posting</div>
                  {report.jd.summary && (
                    <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-dim)" }}>
                      {report.jd.summary}
                    </p>
                  )}
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {report.jd.requirements.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold" style={{ color: "var(--text)" }}>
                          Requirements
                        </div>
                        <ul className="mt-1 flex flex-col gap-1 text-[11px]"
                            style={{ color: "var(--text-dim)" }}>
                          {report.jd.requirements.map((r, i) => <li key={i}>· {r}</li>)}
                        </ul>
                      </div>
                    )}
                    {report.jd.nice_to_haves.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold" style={{ color: "var(--text)" }}>
                          Nice to have
                        </div>
                        <ul className="mt-1 flex flex-col gap-1 text-[11px]"
                            style={{ color: "var(--text-dim)" }}>
                          {report.jd.nice_to_haves.map((r, i) => <li key={i}>· {r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="eyebrow">keywords · where they came from · what happened</div>
                  <div className="overflow-x-auto">
                  <table className="mt-2 w-full text-[11px]">
                    <thead>
                      <tr style={{ color: "var(--text-faint)" }}>
                        <th className="pb-1 pr-2 text-left font-normal">keyword</th>
                        <th className="pb-1 pr-2 text-left font-normal">source in the JD</th>
                        <th className="pb-1 pr-2 text-left font-normal">baseline</th>
                        <th className="pb-1 text-left font-normal">outcome</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      {report.keywords.map((k, i) => {
                        const [label, color] = ACTION_LABEL[k.action] ?? ["?", "var(--text-dim)"];
                        return (
                          <tr key={i} style={{ borderTop: "1px solid var(--line-soft)" }}>
                            <td className="py-1.5 pr-2 font-bold whitespace-nowrap">{k.keyword}</td>
                            <td className="py-1.5 pr-2" style={{ color: "var(--text-dim)" }}>
                              {k.jd_quote ? <>“{k.jd_quote}”</> : "·"}
                            </td>
                            <td className="py-1.5 pr-2 whitespace-nowrap"
                                style={{ color: k.in_baseline ? "var(--green)" : "var(--text-faint)" }}>
                              {k.in_baseline ? "✓ had it" : "✕ missing"}
                            </td>
                            <td className="py-1.5">
                              <span style={{ color }}>{label}</span>
                              {k.action === "added" && (
                                <div className="mt-0.5" style={{ color: "var(--text-dim)" }}>
                                  {k.section && <span>→ {k.section}. </span>}
                                  {k.after && <HighlightedDiff baseline={k.before} tailored={k.after} />}
                                </div>
                              )}
                              {k.reason && (
                                <div className="mt-0.5" style={{ color: "var(--text-faint)" }}>
                                  {k.reason}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>

                {report.diff_sections.some((d) => d.baseline !== d.tailored) && (
                  <div className="mt-5" data-tour="diff-section">
                    <div className="eyebrow">what changed vs the baseline (additions highlighted)</div>
                    <div className="mt-2 flex flex-col gap-3">
                      {report.diff_sections
                        .filter((d) => d.tailored && d.baseline !== d.tailored)
                        .map((d, i) => (
                          <div key={i}>
                            <div className="text-[11px] font-bold">{d.section}</div>
                            <HighlightedDiff baseline={d.baseline} tailored={d.tailored} />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {(report.resume_rationale || report.cover_rationale) && (
                  <div className="mt-5">
                    <div className="eyebrow">thinking &amp; rationale</div>
                    {report.resume_rationale && (
                      <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-dim)" }}>
                        <b style={{ color: "var(--text)" }}>Resume:</b> {report.resume_rationale}
                      </p>
                    )}
                    {report.cover_rationale && (
                      <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-dim)" }}>
                        <b style={{ color: "var(--text)" }}>Cover letter:</b> {report.cover_rationale}
                      </p>
                    )}
                  </div>
                )}

                {report.master_suggestions.length > 0 && (
                  <div className="mt-5">
                    <div className="eyebrow">genuinely missing · worth adding to the master?</div>
                    <ul className="mt-2 flex flex-col gap-1 text-[11px]"
                        style={{ color: "var(--text-dim)" }}>
                      {report.master_suggestions.map((s, i) => <li key={i}>· {s}</li>)}
                    </ul>
                  </div>
                )}

                <div className="mt-5">
                  <div className="eyebrow">ats breakdown</div>
                  <div className="mt-2"><ScoreBars ats={report.ats} /></div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
