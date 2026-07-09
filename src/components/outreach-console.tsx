"use client";

// Cold outreach, demo edition. Searching a company plays the real run's
// states for a few seconds, then lands a drafted row whose draft opens in
// place. The real run scrapes for a published careers email and drops the
// draft into Gmail; nothing is ever sent automatically, there or here.

import { useState } from "react";

import { findPeopleLinks } from "@/lib/people";
import { RESUME_VARIANTS, type Outreach } from "@/lib/types";
import { draftCompanyOutreach } from "@/lib/store";
import { OUTREACH_DRAFTS, type DraftEmail } from "@/lib/fixtures/outreach";
import { DraftModal } from "@/components/draft-modal";

function statusColor(status: string): string {
  if (status === "Drafted") return "var(--green)";
  if (status.toLowerCase().startsWith("fail")) return "var(--red)";
  return "var(--amber)";
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

export function OutreachConsole({ rows }: { rows: Outreach[] }) {
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
    <div className="flex flex-col gap-4">
      <form onSubmit={draft} className="panel flex flex-wrap items-center gap-2 p-3"
            data-tour="outreach-form">
        <input
          className="panel px-2 py-1.5 text-xs"
          style={{ minWidth: "16rem" }}
          placeholder="Company name (try any fictional one)"
          value={company}
          maxLength={80}
          onChange={(e) => setCompany(e.target.value)}
        />
        <select
          className="panel cell-select px-2 py-1.5 text-xs"
          aria-label="Resume variant"
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
        <button className="btn-amber px-4 py-1.5 text-xs" type="submit"
                disabled={busy || !company.trim()}>
          {busy ? (
            <>
              <span className="blink mr-1">●</span>
              Working… (finding a published email, writing the draft)
            </>
          ) : (
            "✉ Draft outreach"
          )}
        </button>
        <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
          the real run takes about a minute on Cloud Run; the demo replays it in four seconds
        </span>
      </form>

      <div className="panel overflow-x-auto" data-tour="outreach-table">
        <table className="console-table">
          <thead>
            <tr>
              <th>Company</th><th>Resume</th><th>Draft</th><th>Emails found</th>
              <th>Find the person</th><th>Cover</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.row}>
                <td>
                  <span className="font-semibold">{o.company}</span>
                  {o.domain && (
                    <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                      {o.domain}
                    </div>
                  )}
                </td>
                <td title={o.variantReason} style={{ color: "var(--text-dim)" }}>
                  {o.variant || "·"}
                </td>
                <td>
                  {o.draft ? (
                    <button className="hover:underline" style={{ color: "var(--green)" }}
                            onClick={() => openDraft(o)}>
                      open draft ↗
                    </button>
                  ) : "·"}
                </td>
                <td className="max-w-64 text-[10px]" title={o.emailsFound}
                    style={{ color: o.emailsFound ? "var(--text-dim)" : "var(--text-faint)" }}>
                  {o.emailsFound
                    ? o.emailsFound.split(";").slice(0, 3).map((p, i) => (
                        <div key={i} className="truncate">{p.trim()}</div>
                      ))
                    : "none published · draft left unaddressed"}
                </td>
                <td className="max-w-72">
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    {findPeopleLinks(o.company).slice(0, 3).map((l) => (
                      <span key={l.label} className="text-[10px]"
                            title="In the real console these are live people-search links"
                            style={{ color: "var(--text-dim)" }}>
                        {l.label} ↗
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ color: o.coverLetter === "yes" ? "var(--green)" : "var(--text-faint)" }}>
                  {o.coverLetter === "yes" ? "✓" : "·"}
                </td>
                <td style={{ color: statusColor(o.status) }}>{o.status || "·"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center"
                    style={{ color: "var(--text-faint)" }}>
                  No drafts yet. Search a company above to create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && <DraftModal draft={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
