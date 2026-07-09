"use client";

// Shown when a visitor presses a pipeline button on a row the demo has no
// pre-built artifacts for. Honest beats fake: we say what the real console
// would do, and point at the rows where the demo can actually show it.

import { useEffect } from "react";
import { createPortal } from "react-dom";

const CONTENT = {
  tailor: {
    title: "Tailoring runs the real pipeline",
    body: `In the real console this button extracts the JD's keywords, rewrites the master resume within strict truth guardrails, runs a judge-guided rewrite loop (up to 10 attempts, improvements only), compiles a one-page PDF with pdflatex, and uploads it to Drive with a transparency report. About a minute per job.

The demo ships pre-built artifacts for the highlighted jobs instead of faking a model call. Try ✨ Tailor on the Emberline "AI Engineer, Copilot Features" row, or retry the failed Nimbus Forge row to watch the recovery path.`,
  },
  draft: {
    title: "Drafting hunts for a real address",
    body: `In the real console this button picks the best master resume, writes a short technical cold email (110 words max, no invented claims), scrapes the company's own site for a published careers email (never guessed), and drops everything as a Gmail draft with the PDFs attached.

The demo has drafts ready on a few rows: try ✉ Draft on the Marrowstone, Osprey Compute, Bluewater Ledger, or Driftwood Metrics jobs.`,
  },
} as const;

export function DemoNote({
  kind,
  onClose,
}: {
  kind: keyof typeof CONTENT;
  onClose: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const c = CONTENT[kind];
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9995, display: "flex",
        alignItems: "center", justifyContent: "center", background: "rgba(5,7,9,0.78)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise"
        style={{
          width: "100%", maxWidth: 460, margin: 16, padding: 24,
          background: "#11161c", borderRadius: 12,
          border: "1px solid var(--line)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div className="eyebrow">demo note</div>
        <div className="display mt-2 text-lg font-bold">{c.title}</div>
        <p className="mt-3 whitespace-pre-line text-xs leading-5"
           style={{ color: "var(--text-dim)" }}>
          {c.body}
        </p>
        <button className="btn-amber mt-5 px-4 py-2 text-xs" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>,
    document.body,
  );
}
