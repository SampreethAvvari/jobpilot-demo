"use client";

// Cold outreach, demo edition. Searching a company plays the real run's
// states for a few seconds, then lands a drafted card whose draft opens in
// place. The real run scrapes for a published careers email and drops the
// draft into Gmail; nothing is ever sent automatically, there or here.

import { useState } from "react";

import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { findPeopleLinks } from "@/lib/people";
import { RESUME_VARIANTS, type Outreach } from "@/lib/types";
import { draftCompanyOutreach, useDemo } from "@/lib/store";
import { OUTREACH_DRAFTS, type DraftEmail } from "@/lib/fixtures/outreach";
import { DraftModal } from "@/components/draft-modal";

/** Tone + blink for the status badge: "Drafted" is done, anything starting
 * with "fail" failed, everything else is still in flight. */
function outreachTone(status: string): { tone: "emerald" | "rose" | "amber"; blink: boolean } {
  if (status === "Drafted") return { tone: "emerald", blink: false };
  if (status.toLowerCase().startsWith("fail")) return { tone: "rose", blink: false };
  return { tone: "amber", blink: true };
}

const GENERIC_DRAFT = (o: Outreach): DraftEmail => ({
  to: o.emailsFound ? o.emailsFound.split(" ")[0] : "",
  subject: o.subject,
  body: `Hi ${o.company} team,

I build AI systems that have to be right, not just impressive. Signalcast, my open-source eval harness, gates releases on regression suites; Atlas Notes answers with citations or refuses. At Halespring I shipped a recommendation model that lifted click-through 14%.

If you are hiring early-career engineers who ship with eval coverage, my resume and a tailored cover letter are attached.

Jane Doe
janedoe.dev · linkedin.com/in/janedoe · github.com/janedoe`,
  attachments: [`Jane_Doe_${o.variant || "AIE"}.pdf`, `Cover_${o.company.replace(/\s+/g, "_")}.pdf`],
});

export function OutreachConsole() {
  const { outreach: rows } = useDemo();
  const [company, setCompany] = useState("");
  const [variant, setVariant] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<DraftEmail | null>(null);

  function draft(e: React.FormEvent) {
    e.preventDefault();
    const name = company.trim();
    if (!name || busy) return;
    setBusy(true);
    draftCompanyOutreach(name, variant, () => setBusy(false));
    setCompany("");
  }

  function openDraft(o: Outreach) {
    const key = o.draft.replace("demo:outreach:", "");
    setOpen(OUTREACH_DRAFTS[key] ?? GENERIC_DRAFT(o));
  }

  return (
    <div className="rise flex flex-col gap-4">
      <form
        onSubmit={draft}
        className="card flex flex-wrap items-center gap-2 p-4"
        data-tour="outreach-form"
      >
        <input
          className="input"
          style={{ minWidth: "16rem" }}
          placeholder="Company name (try any fictional one)"
          value={company}
          maxLength={80}
          onChange={(e) => setCompany(e.target.value)}
          aria-label="company name"
        />
        <select
          className="input"
          aria-label="resume variant"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        >
          <option value="">resume: auto-pick</option>
          {RESUME_VARIANTS.map((v) => (
            <option key={v} value={v}>
              resume: {v}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="btn btn-sm btn-primary"
          disabled={busy || !company.trim()}
        >
          {busy ? (
            <>
              <span className="blink mr-1">●</span>
              Working… (finding a published email, writing the draft)
            </>
          ) : (
            "✉ Draft outreach"
          )}
        </button>
        <span className="text-[11px]" style={{ color: "var(--ink-35)" }}>
          the real run takes about a minute on Cloud Run; the demo replays it in under four seconds
        </span>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No outreach yet" hint="Search a company above to create your first one." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-tour="outreach-table">
          {rows.map((o) => (
            <OutreachCard key={o.row} o={o} onOpenDraft={openDraft} />
          ))}
        </div>
      )}

      {open && <DraftModal draft={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function OutreachCard({ o, onOpenDraft }: { o: Outreach; onOpenDraft: (o: Outreach) => void }) {
  const { tone, blink } = outreachTone(o.status);
  const people = findPeopleLinks(o.company);

  return (
    <article className="card card-hover rise flex flex-col gap-3 p-5">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className="truncate font-semibold"
            style={{ fontFamily: "var(--font-archivo)", fontSize: 16, color: "var(--ink)" }}
            title={o.company}
          >
            {o.company}
          </p>
          {o.domain && (
            <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--ink-55)" }}>
              {o.domain}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge tone="neutral">{o.variant || "·"}</Badge>
          <span className={blink ? "blink" : undefined}>
            <Badge tone={tone}>{o.status || "·"}</Badge>
          </span>
        </div>
      </header>

      {o.variantReason && (
        <p className="truncate text-[11px]" style={{ color: "var(--ink-35)" }} title={o.variantReason}>
          {o.variantReason}
        </p>
      )}

      <div
        className="mt-auto flex flex-wrap items-center gap-1.5 border-t pt-3"
        style={{ borderColor: "var(--line)" }}
      >
        {o.draft ? (
          <button type="button" onClick={() => onOpenDraft(o)} className="btn btn-sm btn-ghost">
            Draft ↗
          </button>
        ) : (
          <span className="btn btn-sm btn-ghost" style={{ color: "var(--ink-35)" }}>
            Draft ·
          </span>
        )}

        <span
          className="btn btn-sm btn-ghost"
          style={{ color: o.coverLetter === "yes" ? "var(--emerald)" : "var(--ink-35)" }}
        >
          {o.coverLetter === "yes" ? "Cover ✓" : "Cover ·"}
        </span>

        <span
          className="btn btn-sm btn-ghost"
          title={o.emailsFound || undefined}
          style={{ color: o.emailsFound ? "var(--blue)" : "var(--ink-35)" }}
        >
          {o.emailsFound ? "Emails ✓" : "Emails ·"}
        </span>

        <details className="inline-block">
          <summary className="btn btn-sm btn-ghost inline-flex cursor-pointer list-none select-none">
            Find the person
          </summary>
          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 pl-1">
            {people.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener"
                className="text-[11px] hover:underline"
                style={{ color: "var(--ink-55)" }}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </details>
      </div>

      {o.emailsFound && (
        <p className="truncate text-[11px]" style={{ color: "var(--ink-35)" }} title={o.emailsFound}>
          found: {o.emailsFound}
        </p>
      )}
    </article>
  );
}
