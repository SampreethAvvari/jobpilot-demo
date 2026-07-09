"use client";

// The watchlist, demo edition: adding a company appends a pending row the
// way the real resolver queue does; removals are instant. All client-side,
// resets on reload.

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Company } from "@/lib/types";
import { liveAge as age, norm, postedTs, type CompanyJobMeta } from "@/lib/company-match";
import { addCompany, removeCompany, useDemo } from "@/lib/store";

function statusColor(status: string): string {
  if (status === "active") return "var(--green)";
  if (status.startsWith("error")) return "var(--red)";
  if (status === "unsupported") return "var(--text-faint)";
  return "var(--amber)"; // pending / blank: resolver picks it up next run
}

const EMPTY: CompanyJobMeta = { remaining: 0, newest: "" };

export function CompaniesTable({
  companies,
  meta = {},
}: {
  companies: Company[];
  meta?: Record<string, CompanyJobMeta>;
}) {
  const [sortBy, setSortBy] = useState<"newest" | "jobs" | "name">("newest");
  const [fresh, setFresh] = useState(0);
  const [showQuiet, setShowQuiet] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [added, setAdded] = useState("");
  const { now } = useDemo();

  const { visible, quiet } = useMemo(() => {
    const rows = companies.map((c) => ({ c, m: meta[norm(c.company)] ?? EMPTY }));
    const inWindow = (m: CompanyJobMeta) =>
      fresh === 0 || (postedTs(m.newest) && now - postedTs(m.newest) <= fresh * 3600_000);
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
    setAdded(name.trim());
    setName("");
    setUrl("");
    setShowQuiet(true); // the new row starts quiet; let the visitor see it landed
    setTimeout(() => setAdded(""), 6000);
  }

  function remove(c: Company) {
    if (!window.confirm(`Stop watching ${c.company}?`)) return;
    removeCompany(c.row);
  }

  function renderRow({ c, m }: { c: Company; m: CompanyJobMeta }) {
    return (
      <tr key={c.row}>
        <td>
          <Link className="hover:underline"
                href={`/companies/view/?c=${encodeURIComponent(c.company)}`}>
            {c.company}
          </Link>
        </td>
        <td style={{ color: "var(--text-dim)" }}>{c.ats || "·"}</td>
        <td style={{ color: statusColor(c.status) }}>{c.status || "pending"}</td>
        <td title={`matched at last fetch: ${c.jobsLastFetch || "0"}`}>
          <Link className="hover:underline"
                href={`/companies/view/?c=${encodeURIComponent(c.company)}`}>
            {m.remaining}
          </Link>
        </td>
        <td className="whitespace-nowrap"
            title={m.newest || "no dated open jobs"}
            style={{
              color: postedTs(m.newest) && now - postedTs(m.newest) <= 24 * 3600_000
                ? "var(--green)" : "var(--text-dim)",
            }}>
          {age(m.newest, now)}
        </td>
        <td className="whitespace-nowrap" style={{ color: "var(--text-dim)" }}>
          {c.lastChecked || "·"}
        </td>
        <td className="max-w-72 truncate" style={{ color: "var(--text-faint)" }}
            title={c.notes}>{c.notes}</td>
        <td>
          <button className="text-xs hover:underline"
                  style={{ color: "var(--red)" }} onClick={() => remove(c)}>
            remove
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={add} className="panel flex flex-wrap items-center gap-2 p-3"
            data-tour="watch-form">
        <input
          className="panel px-2 py-1.5 text-xs"
          style={{ minWidth: "14rem" }}
          placeholder="Company name (fictional ones fit right in)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="panel grow px-2 py-1.5 text-xs"
          style={{ minWidth: "16rem" }}
          placeholder="Careers URL · optional, but required for Workday boards"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn-amber" type="submit" disabled={!name.trim()}>
          + Watch company
        </button>
      </form>
      {added && (
        <div className="text-xs" style={{ color: "var(--green)" }}>
          {added} added as pending. In the real pipeline the resolver detects its ATS
          and starts polling within one run; in the demo it stays pending.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Sort companies" value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          <option value="newest">sort: newest job</option>
          <option value="jobs">sort: most jobs</option>
          <option value="name">sort: name</option>
        </select>
        <select className="panel cell-select px-2 py-1.5 text-xs" aria-label="Newest job age filter" value={fresh}
                onChange={(e) => setFresh(Number(e.target.value))}>
          <option value={0}>newest job: any age</option>
          <option value={24}>newest job ≤ 24h</option>
          <option value={72}>newest job ≤ 3d</option>
          <option value={168}>newest job ≤ 7d</option>
        </select>
        <span style={{ color: "var(--text-dim)" }}>
          {visible.length} compan{visible.length === 1 ? "y" : "ies"} with open jobs for you
        </span>
      </div>

      <div className="panel overflow-x-auto" data-tour="companies-table">
        <table className="console-table">
          <thead>
            <tr>
              <th>Company</th><th>ATS</th><th>Status</th><th>Jobs</th>
              <th>Newest job</th><th>Last checked</th><th>Notes</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(renderRow)}
            {visible.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center"
                      style={{ color: "var(--text-faint)" }}>
                Nothing matches the current filters. Every watched company is
                still checked twice an hour.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {quiet.length > 0 && (
        <div className="flex flex-col gap-2">
          <button className="btn-ghost self-start px-2 py-1 text-xs"
                  data-tour="quiet-toggle"
                  onClick={() => setShowQuiet((s) => !s)}>
            {showQuiet ? "▾ hide" : "▸ show"} {quiet.length} quiet
            compan{quiet.length === 1 ? "y" : "ies"} (no relevant jobs right now, still watched)
          </button>
          {showQuiet && (
            <div className="panel overflow-x-auto">
              <table className="console-table">
                <thead className="sr-only">
                  <tr>
                    <th>Company</th><th>ATS</th><th>Status</th><th>Jobs</th>
                    <th>Newest job</th><th>Last checked</th><th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{quiet.map(renderRow)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
