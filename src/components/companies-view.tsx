"use client";

// The companies grid + filter/sort bar, demo edition. Adding a company
// appends a pending row the way the real resolver queue does; removals are
// instant. Visible/quiet split, sorts, and the fresh filter are ported from
// the pre-redesign companies-table.tsx (the semantics reference); the card
// layout mirrors the real console's companies-view.tsx, wired to the demo
// store instead of `/api/companies`.

import Link from "next/link";
import { useMemo, useState } from "react";

import Button from "./ui/button";
import { FilterBar, Segmented } from "./ui/filter-bar";
import EmptyState from "./ui/empty-state";
import type { Company } from "@/lib/types";
import { companyJobMeta, liveAge as age, norm, postedTs, type CompanyJobMeta } from "@/lib/company-match";
import { addCompany, removeCompany, useDemo } from "@/lib/store";

/** Health dot color, ported from the pre-redesign table's statusColor. */
function statusColor(status: string): string {
  if (status === "active") return "var(--emerald)";
  if (status.startsWith("error")) return "var(--rose)";
  if (status === "unsupported") return "var(--ink-35)";
  return "var(--amber)"; // pending / blank: resolver picks it up next run
}

const EMPTY: CompanyJobMeta = { remaining: 0, newest: "" };

type SortKey = "newest" | "jobs" | "name";

const SORT_OPTIONS = [
  { value: "newest", label: "newest job" },
  { value: "jobs", label: "most jobs" },
  { value: "name", label: "name" },
];

const FRESH_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "any age" },
  { value: 24, label: "24h" },
  { value: 72, label: "3d" },
  { value: 168, label: "7d" },
];

function HealthDot({ status }: { status: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: statusColor(status) }}
      title={status || "pending"}
    />
  );
}

export function CompaniesView() {
  const { companies, jobs, now } = useDemo();
  const meta = useMemo(() => companyJobMeta(companies, jobs), [companies, jobs]);

  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [fresh, setFresh] = useState(0); // hours; 0 = any
  const [showQuiet, setShowQuiet] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const { visible, quiet } = useMemo(() => {
    const rows = companies.map((c) => ({ c, m: meta[norm(c.company)] ?? EMPTY }));
    const inWindow = (m: CompanyJobMeta) =>
      fresh === 0 || (postedTs(m.newest) > 0 && now - postedTs(m.newest) <= fresh * 3600_000);
    const visible = rows.filter(({ m }) => m.remaining > 0 && inWindow(m));
    const quiet = rows.filter((r) => !visible.includes(r));
    visible.sort((a, b) => {
      if (sortBy === "jobs") return b.m.remaining - a.m.remaining;
      if (sortBy === "name") return a.c.company.localeCompare(b.c.company);
      return b.m.newest.localeCompare(a.m.newest) || b.m.remaining - a.m.remaining;
    });
    quiet.sort((a, b) => a.c.company.localeCompare(b.c.company));
    return { visible, quiet };
  }, [companies, meta, sortBy, fresh, now]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addCompany(name.trim(), url.trim());
    setName("");
    setUrl("");
    setShowQuiet(true); // the new row starts quiet, let the visitor see it landed
  }

  function remove(c: Company) {
    if (!window.confirm(`Stop watching ${c.company}?`)) return;
    removeCompany(c.row);
  }

  return (
    <div className="rise flex flex-col gap-4">
      <form onSubmit={add} className="card flex flex-wrap items-center gap-2 p-4" data-tour="watch-form">
        <input
          className="input"
          style={{ minWidth: "14rem" }}
          placeholder="Company name (fictional ones fit right in)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="company name"
        />
        <input
          className="input grow"
          style={{ minWidth: "18rem" }}
          placeholder="Careers URL, optional but required for Workday boards"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="careers url"
        />
        <Button type="submit" disabled={!name.trim()}>
          + Watch company
        </Button>
      </form>

      <FilterBar>
        <Segmented value={sortBy} onChange={(v) => setSortBy(v as SortKey)} options={SORT_OPTIONS} />
        <select
          className="input h-9 text-[12.5px]"
          value={fresh}
          onChange={(e) => setFresh(Number(e.target.value))}
          aria-label="filter by newest job age"
        >
          {FRESH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              newest job: {o.label}
            </option>
          ))}
        </select>
        <span className="eyebrow ml-auto whitespace-nowrap">
          {visible.length} compan{visible.length === 1 ? "y" : "ies"} with open jobs for you
        </span>
      </FilterBar>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing matches the current filters"
          hint="Every watched company is still being checked twice an hour."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-tour="companies-table">
          {visible.map(({ c, m }) => (
            <CompanyCard key={c.row} c={c} m={m} now={now} onRemove={remove} />
          ))}
        </div>
      )}

      {quiet.length > 0 && (
        <details
          className="card"
          open={showQuiet}
          onToggle={(e) => setShowQuiet(e.currentTarget.open)}
        >
          <summary
            className="flex cursor-pointer select-none list-none items-center gap-1.5 px-4 py-3 text-[13px]"
            style={{ color: "var(--ink-55)" }}
            data-tour="quiet-toggle"
          >
            <span style={{ color: "var(--ink-35)" }}>{showQuiet ? "▾" : "▸"}</span>
            {quiet.length} quiet compan{quiet.length === 1 ? "y" : "ies"}, still polled
          </summary>
          <div className="flex flex-col border-t" style={{ borderColor: "var(--line)" }}>
            {quiet.map(({ c, m }) => (
              <div
                key={c.row}
                className="flex items-center justify-between gap-3 border-b px-4 py-2.5 text-[13px] last:border-b-0"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <HealthDot status={c.status} />
                  <Link
                    href={`/companies/view/?c=${encodeURIComponent(c.company)}`}
                    className="truncate font-medium hover:underline"
                    style={{ color: "var(--ink)" }}
                  >
                    {c.company}
                  </Link>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span style={{ color: "var(--ink-35)" }}>{m.remaining} jobs</span>
                  <Button variant="danger" size="sm" onClick={() => remove(c)}>
                    remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function CompanyCard({
  c,
  m,
  now,
  onRemove,
}: {
  c: Company;
  m: CompanyJobMeta;
  now: number;
  onRemove: (c: Company) => void;
}) {
  const ts = postedTs(m.newest);
  const fresh = ts > 0 && now - ts <= 24 * 3600_000;
  return (
    <article className="card card-hover rise flex flex-col gap-4 p-5">
      <header className="flex items-start gap-2.5">
        <div className="pt-1.5">
          <HealthDot status={c.status} />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/companies/view/?c=${encodeURIComponent(c.company)}`}
            className="block truncate font-semibold hover:underline"
            style={{ fontFamily: "var(--font-archivo)", fontSize: 16, color: "var(--ink)" }}
            title={c.company}
          >
            {c.company}
          </Link>
          <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--ink-55)" }}>
            {c.ats || "custom board"}
            {c.careersUrl && (
              <a
                href={c.careersUrl}
                target="_blank"
                rel="noopener"
                className="ml-1.5 hover:underline"
                style={{ color: "var(--ink-35)" }}
              >
                careers ↗
              </a>
            )}
          </p>
        </div>
      </header>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">left to apply</p>
          <p
            className="mt-0.5 font-extrabold"
            style={{ fontFamily: "var(--font-archivo)", fontSize: 34, color: "var(--ink)" }}
            title={`matched at last fetch: ${c.jobsLastFetch || "0"}`}
          >
            {m.remaining}
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow">newest job</p>
          <p
            className="mt-0.5 text-[13px] font-medium"
            style={{ color: fresh ? "var(--emerald)" : "var(--ink-55)" }}
            title={m.newest || "no dated open jobs"}
          >
            {age(m.newest, now)}
          </p>
        </div>
      </div>

      <div
        className="mt-auto flex items-center justify-between gap-2 border-t pt-3"
        style={{ borderColor: "var(--line)" }}
      >
        <span className="truncate text-[11px]" style={{ color: "var(--ink-35)" }} title={c.notes}>
          checked {c.lastChecked || "never"}
        </span>
        <Button variant="danger" size="sm" onClick={() => onRemove(c)}>
          remove
        </Button>
      </div>
    </article>
  );
}
