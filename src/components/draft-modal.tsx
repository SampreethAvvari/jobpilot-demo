"use client";

// The real console's draft links open Gmail drafts. The demo shows the same
// drafted email in place. Nothing is sendable from here, which is the point:
// the real system never sends either.

import { useEffect } from "react";
import { createPortal } from "react-dom";

import type { DraftEmail } from "@/lib/fixtures/outreach";

export function DraftModal({ draft, onClose }: { draft: DraftEmail; onClose: () => void }) {
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
          width: "min(640px, 94vw)", maxHeight: "86vh", overflowY: "auto",
          margin: 16, background: "#11161c", borderRadius: 12,
          border: "1px solid rgba(177,140,255,0.4)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
        data-tour="draft-body"
      >
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3"
             style={{ borderColor: "var(--line-soft)" }}>
          <span className="recorded-tag" style={{ color: "var(--violet)" }}>
            gmail draft · never sent automatically
          </span>
          <button className="btn-ghost px-2 py-1 text-xs" onClick={onClose}>✕</button>
        </div>

        <div className="px-6 py-5 text-xs">
          <div className="grid gap-1.5" style={{ color: "var(--text-dim)" }}>
            <div>
              <span className="eyebrow mr-2">to</span>
              {draft.to || <span style={{ color: "var(--amber)" }}>
                left blank · no published email found, people-search links provided instead
              </span>}
            </div>
            <div>
              <span className="eyebrow mr-2">subject</span>
              <b style={{ color: "var(--text)" }}>{draft.subject}</b>
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
              color: "var(--text-dim)",
              borderColor: "var(--line-soft)",
            }}
          >
            {draft.body}
          </pre>

          <p className="mt-4 text-[11px]" style={{ color: "var(--text-faint)" }}>
            Drafts stay in the pilot&apos;s Gmail until they read, edit, and send them.
            Under 110 words, technical only, no invented claims: those rules are in the
            prompt, not in the fine print.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
