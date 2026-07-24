"use client";

// The real console's draft links open Gmail drafts. The demo shows the same
// drafted email in place. Nothing is sendable from here, which is the point:
// the real system never sends either.

import type { DraftEmail } from "@/lib/fixtures/outreach";
import Modal from "@/components/ui/modal";

export function DraftModal({ draft, onClose }: { draft: DraftEmail; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} width={640}>
      <div data-tour="draft-body">
        <div className="flex items-center justify-between gap-3 border-b pb-3"
             style={{ borderColor: "var(--line)" }}>
          <span className="recorded-tag" style={{ color: "var(--violet)" }}>
            gmail draft · never sent automatically
          </span>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="pt-5 text-xs">
          <div className="grid gap-1.5" style={{ color: "var(--ink-55)" }}>
            <div>
              <span className="eyebrow mr-2">to</span>
              {draft.to || <span style={{ color: "var(--amber)" }}>
                left blank · no published email found, people-search links provided instead
              </span>}
            </div>
            <div>
              <span className="eyebrow mr-2">subject</span>
              <b style={{ color: "var(--ink)" }}>{draft.subject}</b>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow mr-2">attached</span>
              {draft.attachments.map((a) => (
                <span key={a} className="pill pill-new">📎 {a}</span>
              ))}
            </div>
          </div>

          <pre
            className="mt-5 border-t pt-5 text-xs leading-6"
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-plex-mono), monospace",
              color: "var(--ink-55)",
              borderColor: "var(--line)",
            }}
          >
            {draft.body}
          </pre>

          <p className="mt-4 text-[11px]" style={{ color: "var(--ink-35)" }}>
            Drafts stay in the pilot&apos;s Gmail until they read, edit, and send them.
            Under 110 words, technical only, no invented claims: those rules are in the
            prompt, not in the fine print.
          </p>
        </div>
      </div>
    </Modal>
  );
}
