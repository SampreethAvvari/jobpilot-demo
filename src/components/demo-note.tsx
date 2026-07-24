"use client";

// Shown when a visitor presses a pipeline button on a row the demo has no
// pre-built artifacts for. Honest beats fake: we say what the real console
// would do, and point at the rows where the demo can actually show it.

import Modal from "@/components/ui/modal";

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
  const c = CONTENT[kind];
  return (
    <Modal open onClose={onClose} width={460}>
      <div className="eyebrow">demo note</div>
      <div className="display mt-2 text-lg font-bold">{c.title}</div>
      <p className="mt-3 whitespace-pre-line text-xs leading-5"
         style={{ color: "var(--ink-55)" }}>
        {c.body}
      </p>
      <button className="btn btn-primary mt-5 px-4 py-2 text-xs" onClick={onClose}>
        Got it
      </button>
    </Modal>
  );
}
