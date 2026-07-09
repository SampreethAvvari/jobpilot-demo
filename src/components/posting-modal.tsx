"use client";

// In the real console, job links open the live posting in a new tab and the
// table asks "did you apply?" when you come back. The demo keeps you here:
// links open this fictional posting view, and Apply hands back the same
// confirm flow.

import { useEffect } from "react";
import { createPortal } from "react-dom";

import type { Job } from "@/lib/types";
import { jdFor } from "@/lib/fixtures/jd";
import { FitMeter } from "@/components/status";

export function PostingModal({
  job,
  onClose,
  onApplied,
}: {
  job: Job;
  onClose: () => void;
  onApplied?: () => void; // present when opened via the Apply button
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9990, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "rgba(5,7,9,0.8)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise"
        style={{
          width: "min(720px, 94vw)", maxHeight: "88vh", overflowY: "auto",
          margin: 16, background: "#11161c", borderRadius: 12,
          border: "1px solid var(--line)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="flex items-center justify-between gap-3 border-b px-5 py-3"
          style={{ borderColor: "var(--line-soft)" }}
        >
          <span className="recorded-tag">
            fictional posting · careers.{job.company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example
          </span>
          <button className="btn-ghost px-2 py-1 text-xs" onClick={onClose}>✕</button>
        </div>

        <div className="px-6 py-5" data-tour="posting-body">
          <div className="eyebrow">{job.company} · {job.location}</div>
          <h2 className="display mt-1 text-2xl font-extrabold tracking-tight">
            {job.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs"
               style={{ color: "var(--text-dim)" }}>
            <span>source: {job.source}</span>
            {job.fit !== null && (
              <span className="flex items-center gap-1">
                fit <FitMeter fit={job.fit} />
              </span>
            )}
            <span>sponsorship: {job.sponsorship || "·"}</span>
          </div>

          <pre
            className="mt-5 text-xs leading-6"
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-plex-mono), monospace",
              color: "var(--text-dim)",
            }}
          >
            {jdFor(job)}
          </pre>

          {onApplied && (
            <div className="mt-6 flex items-center gap-3 border-t pt-5"
                 style={{ borderColor: "var(--line-soft)" }}>
              <button
                className="btn-amber px-5 py-2 text-xs"
                onClick={() => { onApplied(); onClose(); }}
              >
                Apply on this site
              </button>
              <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                In the real console this opens the employer&apos;s page; JobPilot asks
                whether you applied when you come back.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
