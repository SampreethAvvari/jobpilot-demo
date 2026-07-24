"use client";

// The one live-AI feature in the demo. A Cloudflare Worker on the free
// Workers AI allocation rewrites pasted resume bullets against a pasted job
// description, with the same truth rule as the real pipeline: rephrase and
// re-emphasize only, never invent. Rate-limited, bot-checked, nothing stored.

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";

const ENDPOINT = process.env.NEXT_PUBLIC_TAILOR_ENDPOINT ?? "";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const LIVE = Boolean(ENDPOINT && SITE_KEY);

const RESUME_CAP = 8000;
const JD_CAP = 6000;

type Suggestion = { before: string; after: string; targets: string };
type TailorResult = {
  suggestions: Suggestion[];
  covered: string[];
  not_addable: string[];
};

const SAMPLE: TailorResult = {
  suggestions: [
    {
      before: "Worked on a recommendation model during my internship.",
      after:
        "Built a two-tower recommendation model for cold-start products, lifting click-through 14% in the A/B test.",
      targets: "ranking, experimentation",
    },
    {
      before: "Used Python and SQL for data tasks.",
      after:
        "Owned feature pipelines end to end in Python and SQL on BigQuery, from backtest to online serving.",
      targets: "feature engineering, production SQL",
    },
    {
      before: "Familiar with LLMs and prompt engineering.",
      after:
        "Shipped an LLM-backed assistant with retrieval and structured-output prompts, gated by a regression eval suite in CI.",
      targets: "LLM integration, evals",
    },
  ],
  covered: ["ranking", "feature engineering", "evals", "production Python"],
  not_addable: ["Kubernetes in production", "team leadership"],
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export default function TailorPage() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [capped, setCapped] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const tsRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef("");
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!LIVE) return;
    const t = setInterval(() => {
      if (window.turnstile && tsRef.current && widgetId.current === undefined) {
        widgetId.current = window.turnstile.render(tsRef.current, {
          sitekey: SITE_KEY,
          theme: "light",
          callback: (token: string) => { tokenRef.current = token; setHasToken(true); },
          "expired-callback": () => { tokenRef.current = ""; setHasToken(false); },
          "error-callback": () => { tokenRef.current = ""; setHasToken(false); },
        });
        clearInterval(t);
      }
    }, 300);
    return () => clearInterval(t);
  }, []);

  const filled = resume.trim().length >= 120 && jd.trim().length >= 120;
  const ready = filled && (!LIVE || hasToken);

  async function run() {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    setIsSample(false);
    setCapped(false);

    if (!LIVE) {
      // No worker configured (local preview): show the labeled sample.
      setTimeout(() => {
        setResult(SAMPLE);
        setIsSample(true);
        setBusy(false);
      }, 1200);
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: resume.slice(0, RESUME_CAP),
          jd: jd.slice(0, JD_CAP),
          token: tokenRef.current,
        }),
      });
      if (res.status === 429) {
        setCapped(true);
        setResult(SAMPLE);
        setIsSample(true);
        return;
      }
      if (res.status === 403) {
        setError("The bot check did not go through. Give the checkbox a second to turn green, then try again.");
        return;
      }
      if (!res.ok) throw new Error(`request failed (${res.status})`);
      const data = (await res.json()) as TailorResult;
      if (!Array.isArray(data.suggestions)) throw new Error("malformed response");
      setResult(data);
    } catch {
      setError("The model call failed. Try again in a minute; meanwhile here is a sample of what it returns.");
      setResult(SAMPLE);
      setIsSample(true);
    } finally {
      setBusy(false);
      if (LIVE && window.turnstile) window.turnstile.reset(widgetId.current);
      tokenRef.current = "";
      setHasToken(false);
    }
  }

  return (
    <div className="rise mx-auto max-w-3xl">
      {LIVE && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}
      <div className="mb-5">
        <div className="eyebrow">live model · the only one in this demo</div>
        <h1 className="display mt-1 text-2xl font-extrabold tracking-tight">
          Tailor <span style={{ color: "var(--amber)" }}>your</span> resume
        </h1>
        <p className="mt-1 text-xs leading-5" style={{ color: "var(--ink-55)" }}>
          Paste a few resume bullets and a job description. A small open-weight model
          on Cloudflare&apos;s free tier rewrites the bullets toward the posting under
          JobPilot&apos;s truth rule: rephrase and re-emphasize only, never invent
          employers, dates, or metrics. Nothing you paste is stored or logged.
        </p>
        <p className="mt-1 text-[11px]" style={{ color: "var(--ink-35)" }}>
          Three runs per visitor per day; the full pipeline (one-page LaTeX PDFs, judge
          loop, cover letters) runs on your own infrastructure, see Run your own.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2" data-tour="tailor-inputs">
        <div className="flex flex-col gap-1">
          <label className="eyebrow" htmlFor="resume-in">your resume bullets</label>
          <textarea
            id="resume-in"
            className="input text-xs leading-5"
            style={{ height: "auto", minHeight: "13rem", padding: "10px 12px", lineHeight: 1.6 }}
            placeholder={"Paste 3 to 8 bullets, e.g.\n• Worked on a recommendation model during my internship\n• Used Python and SQL for data tasks"}
            value={resume}
            maxLength={RESUME_CAP}
            onChange={(e) => setResume(e.target.value)}
          />
          <span className="text-right text-[10px]" style={{ color: "var(--ink-35)" }}>
            {resume.length}/{RESUME_CAP}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="eyebrow" htmlFor="jd-in">the job description</label>
          <textarea
            id="jd-in"
            className="input text-xs leading-5"
            style={{ height: "auto", minHeight: "13rem", padding: "10px 12px", lineHeight: 1.6 }}
            placeholder="Paste the posting text (responsibilities + requirements is enough)"
            value={jd}
            maxLength={JD_CAP}
            onChange={(e) => setJd(e.target.value)}
          />
          <span className="text-right text-[10px]" style={{ color: "var(--ink-35)" }}>
            {jd.length}/{JD_CAP}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {LIVE && <div ref={tsRef} />}
        <Button disabled={!ready} busy={busy} onClick={run}>
          {busy ? "tailoring…" : "⚡ Tailor my bullets"}
        </Button>
        {!filled && (resume || jd) && (
          <span className="text-[11px]" style={{ color: "var(--ink-35)" }}>
            paste at least a few lines on each side
          </span>
        )}
        {filled && LIVE && !hasToken && (
          <span className="text-[11px]" style={{ color: "var(--ink-35)" }}>
            waiting for the bot check on the left…
          </span>
        )}
      </div>

      {capped && (
        <div className="card mt-4 px-4 py-3 text-xs" style={{ color: "var(--amber)" }}>
          The demo hit today&apos;s free limit (it runs entirely on free tiers by design).
          Come back tomorrow, or run the real thing on your own keys below. Meanwhile,
          here is a sample of the output.
        </div>
      )}
      {error && (
        <div className="card mt-4 px-4 py-3 text-xs" style={{ color: "var(--rose)" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 flex flex-col gap-4" data-tour="tailor-result">
          {isSample && !capped && !error && (
            <div className="recorded-tag">
              sample output · the deployed demo runs a live model here
            </div>
          )}
          {result.suggestions.map((s, i) => (
            <div key={i} className="card p-4">
              <div className="eyebrow">bullet {i + 1} · targets: {s.targets}</div>
              <p className="mt-2 text-xs leading-5" style={{ color: "var(--ink-35)" }}>
                <s>{s.before}</s>
              </p>
              <p className="mt-1.5 text-xs leading-5" style={{ color: "var(--emerald)" }}>
                {s.after}
              </p>
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <div className="eyebrow" style={{ color: "var(--emerald)" }}>now covered</div>
              <ul className="mt-2 flex flex-col gap-1 text-xs" style={{ color: "var(--ink-55)" }}>
                {result.covered.map((k) => <li key={k}>✓ {k}</li>)}
              </ul>
            </div>
            <div className="card p-4">
              <div className="eyebrow" style={{ color: "var(--rose)" }}>cannot honestly be added</div>
              <ul className="mt-2 flex flex-col gap-1 text-xs" style={{ color: "var(--ink-55)" }}>
                {result.not_addable.map((k) => <li key={k}>✕ {k}</li>)}
              </ul>
              <p className="mt-2 text-[10px]" style={{ color: "var(--ink-35)" }}>
                the same refusal the real tailor makes: missing experience stays missing
              </p>
            </div>
          </div>

          <div className="card p-5" style={{ borderColor: "var(--amber-soft)" }}>
            <div className="eyebrow" style={{ color: "var(--amber)" }}>want the whole pipeline?</div>
            <p className="mt-2 text-xs leading-5" style={{ color: "var(--ink-55)" }}>
              The full system does this for every matching job automatically, as a
              one-page ATS-checked LaTeX PDF with a cover letter and a transparency
              report, plus the job feed, the watchlist, outreach drafts, and inbox
              alerts you toured. It runs on your own Google Cloud billing for roughly
              $0 to $10 a month.
            </p>
            <Link href="/run-your-own" className="btn btn-primary mt-3 inline-block px-4 py-2 text-xs">
              Run your own →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
